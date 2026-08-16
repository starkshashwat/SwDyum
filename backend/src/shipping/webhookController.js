import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler.js';
import { shippingService } from './shippingService.js';
import { logger } from '../utils/logger.js';
import { supabaseAdmin } from '../config/supabaseClient.js';

// Velocity does not sign its webhooks (verified against their custom API
// docs — the only HMACs are S3 presigned URLs). Two defenses are applied:
//   1. An unguessable token in the URL path, configured in Velocity's
//      dashboard: /api/webhooks/velocity/shipment-status/<VELOCITY_WEBHOOK_SECRET>
//   2. If Velocity ever sends an x-velocity-signature header, it is verified
//      as an HMAC-SHA256 of the raw body with the same secret.
// server.js mounts express.raw() for this route before express.json() so
// req.body arrives as a Buffer here.
function timingSafeEqualStr(a, b) {
    const bufA = Buffer.from(String(a), 'utf8');
    const bufB = Buffer.from(String(b), 'utf8');
    return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

function verifyVelocityRequest(req, rawBody) {
    const secret = process.env.VELOCITY_WEBHOOK_SECRET;
    if (!secret) {
        // Fail closed: a missing secret must never mean "accept everything" —
        // an open endpoint here lets anyone move real orders to Delivered.
        logger.error('VELOCITY_WEBHOOK_SECRET is not configured — rejecting Velocity webhook.');
        return false;
    }

    // Path token (primary defense for unsigned providers)
    if (req.params?.token && timingSafeEqualStr(req.params.token, secret)) {
        return true;
    }

    // Optional HMAC header (used automatically if Velocity starts signing)
    const signatureHeader = req.headers['x-velocity-signature'] || req.headers['x-velocity-signature-256'];
    if (!signatureHeader) return false;
    try {
        const digest = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
        return timingSafeEqualStr(String(signatureHeader).replace(/^sha256=/, ''), digest);
    } catch {
        return false;
    }
}

async function recordRejectedWebhook(rawBody, reason) {
    try {
        const { data: velocityProvider } = await supabaseAdmin
            .from('shipping_providers').select('id').eq('code', 'velocity').maybeSingle();
        let payload = {};
        try { payload = JSON.parse(rawBody); } catch { /* keep empty */ }
        await supabaseAdmin.from('webhook_events').insert([{
            provider_id: velocityProvider?.id,
            event_type: payload.status || 'unknown',
            awb_code: payload.awb,
            velocity_shipment_id: payload.shipment_id,
            raw_payload_json: payload,
            processed: false,
            processing_error: reason
        }]);
    } catch (err) {
        logger.error('Failed to record rejected webhook', { error: err.message });
    }
}

export const handleVelocityWebhook = asyncHandler(async (req, res) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body ?? {});
    const signature = req.headers['x-velocity-signature'] || req.headers['x-velocity-signature-256'];

    // 1. Verify the signature BEFORE acknowledging or parsing anything.
    if (!verifyVelocitySignature(rawBody, signature)) {
        logger.warn('Invalid Velocity webhook signature');
        await recordRejectedWebhook(rawBody, 'Invalid Signature');
        return res.status(401).json({ error: 'Invalid signature' });
    }

    // 2. Acknowledge receipt (Velocity retries on non-2xx).
    res.status(200).send('OK');

    // 3. Process asynchronously, but never let a rejection go unhandled —
    //    an unhandled promise rejection crashes the whole Node process.
    let payload;
    try {
        payload = JSON.parse(rawBody);
    } catch (err) {
        logger.error('Velocity webhook body is not valid JSON', { error: err.message });
        await recordRejectedWebhook(rawBody, 'Malformed JSON');
        return;
    }

    Promise.resolve(shippingService.processWebhook(payload)).catch((err) => {
        logger.error('Velocity webhook processing failed', { error: err.message, stack: err.stack });
    });
});
