import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler.js';
import { shippingService } from './shippingService.js';
import { logger } from '../utils/logger.js';
import { supabaseAdmin } from '../config/supabaseClient.js';

function verifyVelocitySignature(req) {
    const secret = process.env.VELOCITY_WEBHOOK_SECRET;
    if (!secret) return true; // Accept if no secret configured

    // Velocity typically passes signature in headers (e.g. x-velocity-signature)
    // Replace with actual header name per their docs
    const signature = req.headers['x-velocity-signature'];
    if (!signature) return false;

    // The signature might be an HMAC of the raw body
    // If you don't have access to the raw body buffer here (since express.json() is parsed),
    // you might need a raw body parser middleware on this specific route.
    // For now, assuming standard JSON payload HMAC:
    try {
        const hmac = crypto.createHmac('sha256', secret);
        const digest = hmac.update(JSON.stringify(req.body)).digest('hex');
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
    } catch {
        return false;
    }
}

export const handleVelocityWebhook = asyncHandler(async (req, res) => {
    // 1. Acknowledge Receipt Immediately (do not block on processing)
    // We send a 200 immediately to avoid Velocity thinking the webhook failed 
    // due to a slow DB query.
    res.status(200).send('OK');

    const rawPayload = req.body;
    
    // 2. Validate Signature
    const isValid = verifyVelocitySignature(req);
    
    if (!isValid) {
        logger.warn('Invalid Velocity webhook signature', { payload: rawPayload });
        // Still insert into DB but mark as error
        const { data: velocityProvider } = await supabaseAdmin.from('shipping_providers').select('id').eq('code', 'velocity').single();
        await supabaseAdmin.from('webhook_events').insert([{
            provider_id: velocityProvider?.id,
            event_type: rawPayload.status || 'unknown',
            awb_code: rawPayload.awb,
            velocity_shipment_id: rawPayload.shipment_id,
            raw_payload_json: rawPayload,
            processed: false,
            processing_error: 'Invalid Signature'
        }]);
        return;
    }

    // 3. Process Webhook asynchronously
    // Since we already sent 200, we run this without awaiting for the response.
    // Note: error handling is inside processWebhook.
    shippingService.processWebhook(rawPayload);
});
