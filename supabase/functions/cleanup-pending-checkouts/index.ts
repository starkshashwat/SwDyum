// ════════════════════════════════════════════════════════════════════════════
// cleanup-pending-checkouts
// Supabase Edge Function (Deno) — invoked by a Supabase scheduled cron every
// 5 minutes. It finds orders where a Razorpay checkout was initiated but the
// payment was never completed (payment_status = 'Pending' AND
// checkout_expires_at < now()), verifies the true status against the Razorpay
// Orders API, and marks the order as 'failed' / 'Cancelled' if still unpaid.
// ═════════════════════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';

// ── Auth: only allow invocation with the service-role key (cron) ──────────────
function isAuthorized(req: Request): boolean {
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    // Allow the cron's service-role key OR an explicit CRON_SECRET.
    const cronSecret = Deno.env.get('CRON_SECRET') ?? '';
    if (cronSecret && token === cronSecret) return true;
    return !!serviceKey && token === serviceKey;
}

// ── Fetch the true status of a Razorpay order from the Orders API ─────────────
async function fetchRazorpayOrderStatus(razorpayOrderId: string): Promise<any> {
    const keyId = Deno.env.get('RAZORPAY_KEY_ID');
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!keyId || !keySecret) {
        throw new Error('Razorpay keys are not configured');
    }
    const basic = btoa(`${keyId}:${keySecret}`);
    const res = await fetch(`https://api.razorpay.com/v1/orders/${razorpayOrderId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${basic}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const text = await res.text();
        console.error(`Razorpay Orders API error for ${razorpayOrderId}: ${res.status} ${text}`);
        return null;
    }
    return await res.json();
}

// ── Mark an order as failed + add a timeline entry ───────────────────────────
async function markOrderFailed(supabaseAdmin: any, orderId: string, reason: string) {
    const nowIso = new Date().toISOString();
    await supabaseAdmin.from('orders').update({
        payment_status: 'Failed',
        order_status: 'Cancelled',
        status: 'Failed',
        failed_at: nowIso,
        failure_reason: reason,
        updated_at: nowIso,
    }).eq('id', orderId);

    await supabaseAdmin.from('order_timeline').insert([{
        order_id: orderId,
        event: 'Payment Failed',
        note: `Checkout abandoned: ${reason}`,
        created_by: 'system',
    }]);

    console.log(`❌ Order ${orderId} marked failed: ${reason}`);
}

// ── Main handler ─────────────────────────────────────────────────────────────
async function runCleanup() {
    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find pending orders whose checkout window has expired.
    const { data: pendingOrders, error } = await supabaseAdmin
        .from('orders')
        .select('id, razorpay_order_id, payment_status, created_at, checkout_expires_at')
        .eq('payment_status', 'Pending')
        .not('razorpay_order_id', 'is', null)
        .lt('checkout_expires_at', new Date().toISOString())
        .limit(100);

    if (error) {
        console.error('Error querying pending orders:', error);
        return { processed: 0, failed: 0, error: error.message };
    }

    if (!pendingOrders || pendingOrders.length === 0) {
        console.log('No expired pending checkouts found.');
        return { processed: 0, failed: 0 };
    }

    console.log(`Found ${pendingOrders.length} expired pending checkout(s).`);

    let failedCount = 0;
    for (const order of pendingOrders) {
        try {
            const rzpOrder = await fetchRazorpayOrderStatus(order.razorpay_order_id);
            if (!rzpOrder) {
                // Could not verify — skip this cycle, retry next run.
                console.warn(`Could not verify Razorpay order ${order.razorpay_order_id}; skipping.`);
                continue;
            }

            const rzpStatus = rzpOrder.status; // 'created' | 'attempted' | 'paid'

            if (rzpStatus === 'paid') {
                // Razorpay says paid but our DB still says Pending — the webhook may
                // have been missed. Trigger capture processing via a timeline note and
                // leave as-is; a separate reconciliation could call processPaymentCapture.
                console.log(`Order ${order.id} is paid on Razorpay but Pending in DB — webhook may have been missed.`);
                continue;
            }

            let reason: string;
            if (rzpStatus === 'attempted') {
                reason = 'Payment attempted but not completed (Razorpay status: attempted)';
            } else {
                // 'created' — checkout was opened but no payment was ever attempted.
                reason = 'Checkout abandoned — no payment attempt (Razorpay status: created)';
            }

            await markOrderFailed(supabaseAdmin, order.id, reason);
            failedCount++;
        } catch (err) {
            console.error(`Error processing order ${order.id}:`, err);
        }
    }

    console.log(`Cleanup complete. Marked ${failedCount} order(s) as failed.`);
    return { processed: pendingOrders.length, failed: failedCount };
}

serve(async (req) => {
    // Reject unauthorized invocations (only the cron / service role may call).
    if (!isAuthorized(req)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const result = await runCleanup();
        return new Response(JSON.stringify({ ok: true, ...result }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('cleanup-pending-checkouts error:', err);
        return new Response(JSON.stringify({ ok: false, error: 'An unexpected error occurred.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
