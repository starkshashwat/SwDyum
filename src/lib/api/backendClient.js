/**
 * Thin fetch wrapper for the Phase 2 backend's PUBLIC, read-only GET
 * endpoints only.
 *
 * Deliberately excluded (never called from here — these are admin-only
 * or otherwise out of scope for the public storefront client):
 *   - /api/coupons        (admin only)
 *   - /api/reviews        (admin only — moderation, no public read/write)
 *   - /api/orders         (admin only)
 *   - /api/auth/*         (auth flows are out of scope for this task)
 *   - /api/upload/image   (admin only)
 *
 * Every function here can throw (network error, non-2xx status, bad
 * JSON). Callers (catalogService.js) are responsible for catching and
 * falling back to mock data — this module never swallows errors
 * silently.
 */

import { BACKEND_BASE_URL, BACKEND_REQUEST_TIMEOUT_MS } from './config';

async function apiGet(path, params) {
    const url = new URL(`${BACKEND_BASE_URL}${path}`, window.location.origin);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                url.searchParams.set(key, value);
            }
        });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), BACKEND_REQUEST_TIMEOUT_MS);

    let response;
    try {
        response = await fetch(url.toString(), {
            method: 'GET',
            headers: { Accept: 'application/json' },
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeoutId);
    }

    if (!response.ok) {
        throw new Error(`Backend request failed: GET ${path} -> ${response.status}`);
    }

    const json = await response.json();
    return json;
}

/* ─── Categories ──────────────────────────────────────────────────────── */
export const getCategories = (params) => apiGet('/categories', params);
export const getCategoryById = (id) => apiGet(`/categories/${id}`);
export const getCategoryPairings = (categoryId) => apiGet(`/categories/${categoryId}/pairings`);



/* ─── Products ────────────────────────────────────────────────────────── */
export const getProducts = (params) => apiGet('/products', params);
export const getProductById = (id) => apiGet(`/products/${id}`);
export const getProductVariants = (productId) => apiGet(`/products/${productId}/variants`);
export const getProductImages = (productId) => apiGet('/product-images', { product_id: productId });
export const getProductIngredients = (productId) => apiGet('/product-ingredients', { product_id: productId });
/* ─── Content ─────────────────────────────────────────────────────────── */
export const getTrustBadges = (productId) => apiGet('/trust-badges', { product_id: productId });
export const getFaqs = (productId) => apiGet('/faqs', { product_id: productId });
export const getProcessSteps = (productId) => apiGet('/process-steps', { product_id: productId });

/* ─── Shipping & Tracking ─────────────────────────────────────────────── */
import { supabase } from '../../supabaseClient';

export const getOrderTracking = async (orderId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    if (!token) throw new Error("Not authenticated");
    
    const url = new URL(`${BACKEND_BASE_URL}/api/customer/orders/${orderId}/tracking`, window.location.origin);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), BACKEND_REQUEST_TIMEOUT_MS);
    
    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: { 
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            signal: controller.signal,
        });
        
        if (!response.ok) {
            throw new Error(`Backend request failed: GET tracking -> ${response.status}`);
        }
        
        return await response.json();
    } finally {
        clearTimeout(timeoutId);
    }
};
