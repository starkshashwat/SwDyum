import { getVelocityCredentials, updateCredentialTestStatus } from './credentialManager.js';
import { supabaseAdmin } from '../config/supabaseClient.js';
import { logger } from '../utils/logger.js';

const VELOCITY_BASE_URL = process.env.VELOCITY_BASE_URL || 'https://shazam.velocity.in';
const TIMEOUT_MS = 30000;

// ── In-memory token cache ──────────────────────────────────────────────────
// The Velocity token is valid for 24 hours. We cache it in memory and refresh
// 1 hour before expiry for safety.
let cachedToken = null;
let tokenExpiresAt = null;
const TOKEN_SAFETY_BUFFER_MS = 60 * 60 * 1000; // 1 hour

class VelocityApiError extends Error {
    constructor(message, status, payload) {
        super(message);
        this.name = 'VelocityApiError';
        // Upstream 401/403 from Velocity must not be returned as HTTP 401 to admin UI,
        // because apiClient interprets 401 as Admin JWT expiration and logs the admin out.
        this.status = (status === 401 || status === 403) ? 400 : (status || 500);
        this.upstreamStatus = status;
        this.payload = payload;
    }
}

/**
 * Obtains a fresh auth token from Velocity using username/password.
 * POST /custom/api/v1/auth-token
 */
async function authenticate() {
    const creds = await getVelocityCredentials();
    if (!creds) {
        throw new Error('Velocity credentials not configured. Please add username and password in Shipping Settings.');
    }

    const url = `${VELOCITY_BASE_URL}/custom/api/v1/auth-token`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let username = creds.username.trim();
    if (/^\d{10}$/.test(username)) {
        username = `+91${username}`;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password: creds.password
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        const responseText = await response.text();
        let responseJson;
        try {
            responseJson = JSON.parse(responseText);
        } catch {
            throw new VelocityApiError(
                `Velocity auth returned non-JSON response: ${responseText.substring(0, 200)}`,
                response.status,
                null
            );
        }

        if (!response.ok) {
            const msg = responseJson?.message || responseJson?.error || `Auth failed: HTTP ${response.status}`;
            throw new VelocityApiError(msg, response.status, responseJson);
        }

        if (!responseJson.token) {
            throw new VelocityApiError('Velocity auth response missing token field.', response.status, responseJson);
        }

        // Cache the token
        cachedToken = responseJson.token;
        if (responseJson.expires_at) {
            tokenExpiresAt = new Date(responseJson.expires_at).getTime();
        } else {
            // Fallback: assume 24-hour validity
            tokenExpiresAt = Date.now() + (24 * 60 * 60 * 1000);
        }

        logger.info('Velocity auth token obtained successfully', {
            expires_at: new Date(tokenExpiresAt).toISOString()
        });

        return cachedToken;

    } catch (err) {
        clearTimeout(timeout);
        if (err.name === 'AbortError') {
            throw new VelocityApiError('Velocity auth request timed out.', 0, null);
        }
        throw err;
    }
}

/**
 * Returns a valid auth token, refreshing if expired or about to expire.
 */
async function getToken() {
    const now = Date.now();
    if (cachedToken && tokenExpiresAt && (tokenExpiresAt - TOKEN_SAFETY_BUFFER_MS) > now) {
        return cachedToken;
    }
    return await authenticate();
}

/**
 * Invalidates the cached token (used on 401 responses).
 */
function invalidateToken() {
    cachedToken = null;
    tokenExpiresAt = null;
}

/**
 * Core fetch wrapper for Velocity API calls.
 * Uses the auth token (no Bearer prefix) and handles 401 retry.
 */
async function fetchVelocity(endpoint, options = {}, isRetry = false) {
    const token = await getToken();
    const url = `${VELOCITY_BASE_URL}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': token,  // No "Bearer" prefix per Velocity docs
        ...options.headers
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let requestBody = null;
    if (options.body) {
        try {
            requestBody = JSON.parse(options.body);
        } catch {
            requestBody = options.body;
        }
    }

    let response;
    let responseText;
    let responseJson = null;
    let success = false;
    let errorMsg = null;

    try {
        response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal
        });
        
        clearTimeout(timeout);
        
        responseText = await response.text();
        try {
            responseJson = JSON.parse(responseText);
        } catch {
            responseJson = null;
        }

        // Handle 401 — token expired, re-authenticate and retry once
        if (response.status === 401 && !isRetry) {
            logger.info('Velocity returned 401, refreshing token and retrying...');
            invalidateToken();
            return fetchVelocity(endpoint, options, true);
        }

        success = response.ok;

        if (!response.ok) {
            let extractedMsg = `HTTP ${response.status} ${response.statusText}`;
            if (responseJson?.meta?.message) {
                extractedMsg = `${responseJson.meta.message}: ${responseJson.meta.details || ''}`;
            } else if (responseJson?.message) {
                extractedMsg = responseJson.message;
            } else if (responseJson?.error) {
                extractedMsg = responseJson.error;
            }
            throw new VelocityApiError(extractedMsg, response.status, responseJson);
        }

        return responseJson;

    } catch (err) {
        clearTimeout(timeout);
        success = false;
        errorMsg = err.message;
        if (err.name === 'AbortError') {
            throw new VelocityApiError('Velocity API request timed out.', 0, null);
        }
        throw err;
    } finally {
        // Log action if requested
        if (options._logAction) {
            try {
                await supabaseAdmin.from('shipping_action_logs').insert([{
                    action: options._logAction,
                    request_json: requestBody,
                    response_json: responseJson || { raw: responseText },
                    status_code: response?.status,
                    success,
                    error_message: errorMsg
                }]);
            } catch (logErr) {
                logger.error('Failed to write shipping action log', { error: logErr.message });
            }
        }
    }
}

export const velocityClient = {

    // ── Forward Shipment ───────────────────────────────────────────────────

    /**
     * Creates and manifests a forward shipment (orchestration = create + assign courier).
     * POST /custom/api/v1/forward-order-orchestration
     */
    async createForwardOrder(payload, orderId) {
        try {
            const res = await fetchVelocity('/custom/api/v1/forward-order-orchestration', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            
            await supabaseAdmin.from('shipping_action_logs').insert([{
                order_id: orderId,
                action: 'createForwardOrder',
                request_json: payload,
                response_json: res,
                status_code: 200,
                success: true
            }]);
            
            return res;
        } catch (err) {
            await supabaseAdmin.from('shipping_action_logs').insert([{
                order_id: orderId,
                action: 'createForwardOrder',
                request_json: payload,
                response_json: err.payload || { raw: err.message },
                status_code: err.status,
                success: false,
                error_message: err.message
            }]);
            throw err;
        }
    },

    /**
     * Creates a forward order only (no courier assignment).
     * POST /custom/api/v1/forward-order
     */
    async createForwardOrderOnly(payload, orderId) {
        try {
            const res = await fetchVelocity('/custom/api/v1/forward-order', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            
            await supabaseAdmin.from('shipping_action_logs').insert([{
                order_id: orderId,
                action: 'createForwardOrderOnly',
                request_json: payload,
                response_json: res,
                status_code: 200,
                success: true
            }]);
            
            return res;
        } catch (err) {
            await supabaseAdmin.from('shipping_action_logs').insert([{
                order_id: orderId,
                action: 'createForwardOrderOnly',
                request_json: payload,
                response_json: err.payload || { raw: err.message },
                status_code: err.status,
                success: false,
                error_message: err.message
            }]);
            throw err;
        }
    },

    /**
     * Assigns a courier to an existing forward order.
     * POST /custom/api/v1/forward-order-shipment
     */
    async assignForwardCourier(shipmentId, carrierId = '') {
        return fetchVelocity('/custom/api/v1/forward-order-shipment', {
            method: 'POST',
            body: JSON.stringify({
                shipment_id: shipmentId,
                carrier_id: carrierId
            }),
            _logAction: 'assignForwardCourier'
        });
    },

    // ── Reverse Pickup Shipment ────────────────────────────────────────────

    /**
     * Creates and manifests a reverse pickup shipment (orchestration).
     * POST /custom/api/v1/reverse-order-orchestration
     */
    async createReverseOrder(payload, orderId) {
        try {
            const res = await fetchVelocity('/custom/api/v1/reverse-order-orchestration', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            await supabaseAdmin.from('shipping_action_logs').insert([{
                order_id: orderId,
                action: 'createReverseOrder',
                request_json: payload,
                response_json: res,
                status_code: 200,
                success: true
            }]);

            return res;
        } catch (err) {
            await supabaseAdmin.from('shipping_action_logs').insert([{
                order_id: orderId,
                action: 'createReverseOrder',
                request_json: payload,
                response_json: err.payload || { raw: err.message },
                status_code: err.status,
                success: false,
                error_message: err.message
            }]);
            throw err;
        }
    },

    /**
     * Creates a reverse order only (no courier assignment).
     * POST /custom/api/v1/reverse-order
     */
    async createReverseOrderOnly(payload, orderId) {
        try {
            const res = await fetchVelocity('/custom/api/v1/reverse-order', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            await supabaseAdmin.from('shipping_action_logs').insert([{
                order_id: orderId,
                action: 'createReverseOrderOnly',
                request_json: payload,
                response_json: res,
                status_code: 200,
                success: true
            }]);

            return res;
        } catch (err) {
            await supabaseAdmin.from('shipping_action_logs').insert([{
                order_id: orderId,
                action: 'createReverseOrderOnly',
                request_json: payload,
                response_json: err.payload || { raw: err.message },
                status_code: err.status,
                success: false,
                error_message: err.message
            }]);
            throw err;
        }
    },

    /**
     * Assigns a courier to an existing reverse order.
     * POST /custom/api/v1/reverse-order-shipment
     */
    async assignReverseCourier(returnId, warehouseId, carrierId = '') {
        return fetchVelocity('/custom/api/v1/reverse-order-shipment', {
            method: 'POST',
            body: JSON.stringify({
                return_id: returnId,
                warehouse_id: warehouseId,
                carrier_id: carrierId
            }),
            _logAction: 'assignReverseCourier'
        });
    },

    // ── Cancel ─────────────────────────────────────────────────────────────

    /**
     * Cancels one or more shipments by AWB codes.
     * POST /custom/api/v1/cancel-order
     * @param {string[]} awbs - Array of AWB codes (max 50)
     */
    async cancelOrder(awbs) {
        if (!Array.isArray(awbs) || awbs.length === 0) {
            throw new Error('At least one AWB code is required for cancellation.');
        }
        if (awbs.length > 50) {
            throw new Error('Maximum 50 AWBs can be cancelled at once.');
        }

        return fetchVelocity('/custom/api/v1/cancel-order', {
            method: 'POST',
            body: JSON.stringify({ awbs }),
            _logAction: 'cancelOrder'
        });
    },

    // ── Tracking ───────────────────────────────────────────────────────────

    /**
     * Fetches real-time tracking details for one or more shipments.
     * POST /custom/api/v1/order-tracking
     * @param {string[]} awbs - Array of AWB codes to track
     */
    async getTracking(awbs) {
        if (!Array.isArray(awbs)) awbs = [awbs];

        const res = await fetchVelocity('/custom/api/v1/order-tracking', {
            method: 'POST',
            body: JSON.stringify({ awbs })
        });

        return res;
    },

    // ── Serviceability ─────────────────────────────────────────────────────

    /**
     * Checks whether pickup/delivery are supported between two pincodes.
     * POST /custom/api/v1/serviceability
     * @param {object} params - { from, to, payment_mode, shipment_type }
     */
    async checkServiceability({ from, to, payment_mode, shipment_type }) {
        return fetchVelocity('/custom/api/v1/serviceability', {
            method: 'POST',
            body: JSON.stringify({ from, to, payment_mode, shipment_type }),
            _logAction: 'checkServiceability'
        });
    },

    // ── Warehouse ──────────────────────────────────────────────────────────

    /**
     * Creates a new pickup warehouse in Velocity.
     * POST /custom/api/v1/warehouse
     */
    async createWarehouse(payload) {
        return fetchVelocity('/custom/api/v1/warehouse', {
            method: 'POST',
            body: JSON.stringify(payload),
            _logAction: 'createWarehouse'
        });
    },

    // ── Reports ────────────────────────────────────────────────────────────

    /**
     * Fetches status-based summary report for orders.
     * POST /custom/api/v1/reports
     * @param {object} params - { start_date_time, end_date_time, shipment_type }
     */
    async getReports({ start_date_time, end_date_time, shipment_type }) {
        return fetchVelocity('/custom/api/v1/reports', {
            method: 'POST',
            body: JSON.stringify({ start_date_time, end_date_time, shipment_type }),
            _logAction: 'getReports'
        });
    },

    // ── Connection Test ────────────────────────────────────────────────────

    /**
     * Tests the Velocity connection by attempting to authenticate.
     * This validates the stored username/password credentials.
     */
    async testConnection() {
        try {
            invalidateToken();
            await authenticate();
            await updateCredentialTestStatus('connected');
            return { status: 'connected', message: 'Successfully connected to Velocity API.' };
        } catch (err) {
            logger.error('testConnection failed', { message: err.message, status: err.status, payload: err.payload });
            const errorDetails = err.payload?.message || err.payload?.error || err.message;
            if (err instanceof VelocityApiError && (err.status === 401 || err.status === 403)) {
                await updateCredentialTestStatus('invalid_key');
                return { status: 'invalid_key', message: `Authentication failed: ${errorDetails}` };
            }
            await updateCredentialTestStatus('error');
            return { status: 'error', message: errorDetails };
        }
    }
};
