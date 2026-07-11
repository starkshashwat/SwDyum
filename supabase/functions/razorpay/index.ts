import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';

// V19: Echo the request Origin so the frontend invoke works from any
// deployment (production, www, preview, localhost). Webhook security is
// still enforced via HMAC signature verification, not CORS.
const ALLOWED_ORIGINS = [
  'https://swadyum.store',
  'https://www.swadyum.store',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
];

function corsHeaders(req: Request) {
  const origin = req.headers.get('Origin');
  // Echo the requesting origin when present; otherwise fall back to the first
  // allowed origin (used for non-browser requests such as Razorpay webhooks).
  const allow = origin || ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
    'Vary': 'Origin',
  };
}

async function createRazorpayOrder(amount: number, receipt: string) {
  const keyId = Deno.env.get('RAZORPAY_KEY_ID');
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys are missing from environment variables');
  }

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(`${keyId}:${keySecret}`)}`
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: receipt
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Razorpay Error:', errorText);
    throw new Error(`Failed to create order: ${response.statusText}`);
  }

  const orderData = await response.json();
  return { ...orderData, key_id: keyId };
}

async function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
  if (!keySecret) throw new Error('Razorpay key secret is missing');

  const data = `${orderId}|${paymentId}`;
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(keySecret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const signatureHex = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  return signatureHex === signature;
}

async function verifyWebhookSignature(payloadText: string, signature: string) {
  const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
  if (!webhookSecret) { console.error('RAZORPAY_WEBHOOK_SECRET is not set'); return false; }

  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadText));
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  return expectedSignature === signature;
}

// ====================================================================
// Post-Payment Processing — called after payment is confirmed
// Creates payment record, updates order, reduces inventory,
// tracks coupon usage, generates invoice, creates timeline entries.
// Idempotent: checks if payment already processed before proceeding.
// ====================================================================
async function processPaymentCapture(supabaseAdmin: any, razorpayOrderId: string, razorpayPaymentId: string) {
  // 1. Idempotency check — has this payment already been processed?
  const { data: existingPayment } = await supabaseAdmin
    .from('payments')
    .select('id')
    .eq('razorpay_payment_id', razorpayPaymentId)
    .single();

  if (existingPayment) {
    console.log(`Payment ${razorpayPaymentId} already processed. Skipping.`);
    return;
  }

  // 2. Find the order by the Razorpay Order ID stored in payment_id during checkout
  const { data: order, error: orderFetchError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('payment_id', razorpayOrderId)
    .single();

  if (orderFetchError || !order) {
    // Try razorpay_order_id column as fallback
    const { data: order2 } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', razorpayOrderId)
      .single();
    if (!order2) {
      console.error(`Order not found for Razorpay order ${razorpayOrderId}`);
      return;
    }
    // Use this order instead
    return await _processOrder(supabaseAdmin, order2, razorpayOrderId, razorpayPaymentId);
  }

  await _processOrder(supabaseAdmin, order, razorpayOrderId, razorpayPaymentId);
}

async function _processOrder(supabaseAdmin: any, order: any, razorpayOrderId: string, razorpayPaymentId: string) {
  const orderId = order.id;

  // 3. Create payment record
  await supabaseAdmin.from('payments').insert([{
    order_id: orderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_order_id: razorpayOrderId,
    payment_method: 'Online / Razorpay',
    amount: order.total,
    currency: 'INR',
    status: 'Paid',
    payment_date: new Date().toISOString()
  }]);

  // 4. Update order status
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7); // 5-7 days

  await supabaseAdmin
    .from('orders')
    .update({
      status: 'Paid',
      payment_status: 'Paid',
      order_status: 'Confirmed',
      payment_id: razorpayPaymentId,
      razorpay_order_id: razorpayOrderId,
      estimated_delivery: estimatedDelivery.toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId);

  // 5. Timeline entries
  await supabaseAdmin.from('order_timeline').insert([
    { order_id: orderId, event: 'Payment Received', note: `Razorpay Payment ID: ${razorpayPaymentId}`, created_by: 'system' },
    { order_id: orderId, event: 'Order Confirmed', note: 'Payment verified successfully', created_by: 'system' }
  ]);

  // 6. Process inventory reduction
  const { data: items } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (items && items.length > 0) {
    for (const item of items) {
      // Find product by name
      const { data: productData } = await supabaseAdmin
        .from('products')
        .select('id')
        .ilike('name', item.product_name)
        .single();

      if (productData) {
        // Find variant
        const { data: variant } = await supabaseAdmin
          .from('product_variants')
          .select('id, stock_quantity')
          .eq('product_id', productData.id)
          .eq('weight_label', item.weight_label)
          .single();

        if (variant) {
          // Log inventory change — DB trigger auto-updates stock_quantity
          await supabaseAdmin.from('inventory_logs').insert([{
            variant_id: variant.id,
            change_type: 'Order Placed',
            quantity_changed: -item.quantity,
            note: `Order ${orderId}`
          }]);
        }
      }
    }

    // Timeline entry for inventory
    await supabaseAdmin.from('order_timeline').insert([{
      order_id: orderId,
      event: 'Inventory Reduced',
      note: `${items.length} item(s) deducted from stock`,
      created_by: 'system'
    }]);
  }

  // 7. Track coupon usage
  if (order.coupon_code) {
    const { data: couponData } = await supabaseAdmin
      .from('coupons')
      .select('id, times_used')
      .eq('code', order.coupon_code)
      .single();

    if (couponData) {
      // Increment times_used
      await supabaseAdmin
        .from('coupons')
        .update({ times_used: (couponData.times_used || 0) + 1 })
        .eq('id', couponData.id);

      // Create coupon_usage record
      await supabaseAdmin.from('coupon_usage').insert([{
        coupon_id: couponData.id,
        customer_id: order.customer_id,
        order_id: orderId,
        discount_amount: order.discount_amount || 0
      }]);
    }
  }

  // 8. Auto-generate invoice
  const shippingDetails = order.shipping_details || {};
  const productDetails = items ? items.map((item: any) => ({
    name: item.product_name,
    sku: item.sku || '',
    variant: item.weight_label,
    quantity: item.quantity,
    unit_price: item.unit_price,
    discount: item.discount || 0,
    final_price: item.total_price
  })) : [];

  await supabaseAdmin.from('invoices').insert([{
    order_id: orderId,
    invoice_date: new Date().toISOString(),
    customer_name: shippingDetails.name || order.customer_name || '',
    customer_email: shippingDetails.email || order.customer_email || '',
    customer_phone: shippingDetails.phone || order.customer_phone || '',
    billing_address: order.billing_details || shippingDetails,
    shipping_address: shippingDetails,
    product_details: productDetails,
    subtotal: order.subtotal,
    tax: 0, // Future ready
    discount: order.discount_amount || 0,
    shipping_charges: order.shipping_fee || order.shipping || 0,
    grand_total: order.total,
    status: 'Generated'
  }]);

  console.log(`✅ Order ${orderId} fully processed: payment recorded, inventory reduced, invoice generated.`);
}

// ====================================================================
// Payment Failure Processing — called when Razorpay sends payment.failed
// Marks the order as failed/cancelled, records the failed payment attempt,
// and adds a timeline entry. Idempotent: skips if order is already terminal.
// ====================================================================
async function processPaymentFailure(supabaseAdmin: any, razorpayOrderId: string, razorpayPaymentId: string, reason: string, payment: any) {
  // Find the order by razorpay_order_id (set during checkout) or payment_id.
  let order: any = null;
  const lookups = [
    { column: 'razorpay_order_id', value: razorpayOrderId },
    { column: 'payment_id', value: razorpayOrderId },
  ];
  for (const l of lookups) {
    const { data } = await supabaseAdmin.from('orders').select('*').eq(l.column, l.value).single();
    if (data) { order = data; break; }
  }
  if (!order) {
    console.error(`Order not found for failed Razorpay order ${razorpayOrderId}`);
    return;
  }

  // Idempotency: if the order is already Paid/Delivered, do not mark it failed.
  const terminalPayment = ['Paid', 'Refunded', 'Partially Refunded'].includes(order.payment_status);
  if (terminalPayment) {
    console.log(`Order ${order.id} already ${order.payment_status}; ignoring payment.failed.`);
    return;
  }

  const nowIso = new Date().toISOString();

  // Record the failed payment attempt (idempotent on razorpay_payment_id).
  if (razorpayPaymentId) {
    const { data: existingPayment } = await supabaseAdmin
      .from('payments').select('id').eq('razorpay_payment_id', razorpayPaymentId).single();
    if (!existingPayment) {
      await supabaseAdmin.from('payments').insert([{
        order_id: order.id,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_order_id: razorpayOrderId,
        payment_method: payment?.method || 'Online / Razorpay',
        amount: payment?.amount ? payment.amount / 100 : order.total,
        currency: 'INR',
        status: 'Failed',
        failure_reason: reason,
        payment_date: nowIso
      }]);
    }
  }

  // Mark the order failed + cancelled.
  await supabaseAdmin.from('orders').update({
    payment_status: 'Failed',
    order_status: 'Cancelled',
    status: 'Failed',
    failed_at: nowIso,
    failure_reason: reason,
    updated_at: nowIso
  }).eq('id', order.id);

  await supabaseAdmin.from('order_timeline').insert([{
    order_id: order.id,
    event: 'Payment Failed',
    note: `Razorpay: ${reason}${razorpayPaymentId ? ` (Payment ID: ${razorpayPaymentId})` : ''}`,
    created_by: 'system'
  }]);

  console.log(`❌ Order ${order.id} marked failed: ${reason}`);
}

// ====================================================================
// Payment Authorized Processing — called when Razorpay sends
// payment.authorized (payment authorized but not yet captured).
// Records an intermediate 'Authorized' state so the admin can see the
// payment is in progress. Does NOT mark the order as Paid.
// ====================================================================
async function processPaymentAuthorized(supabaseAdmin: any, razorpayOrderId: string, razorpayPaymentId: string, payment: any) {
  let order: any = null;
  const lookups = [
    { column: 'razorpay_order_id', value: razorpayOrderId },
    { column: 'payment_id', value: razorpayOrderId },
  ];
  for (const l of lookups) {
    const { data } = await supabaseAdmin.from('orders').select('*').eq(l.column, l.value).single();
    if (data) { order = data; break; }
  }
  if (!order) {
    console.error(`Order not found for authorized Razorpay order ${razorpayOrderId}`);
    return;
  }

  // If already paid, nothing to do.
  if (order.payment_status === 'Paid') return;

  const nowIso = new Date().toISOString();

  // Record the authorized payment attempt (idempotent).
  if (razorpayPaymentId) {
    const { data: existingPayment } = await supabaseAdmin
      .from('payments').select('id').eq('razorpay_payment_id', razorpayPaymentId).single();
    if (!existingPayment) {
      await supabaseAdmin.from('payments').insert([{
        order_id: order.id,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_order_id: razorpayOrderId,
        payment_method: payment?.method || 'Online / Razorpay',
        amount: payment?.amount ? payment.amount / 100 : order.total,
        currency: 'INR',
        status: 'Authorized',
        payment_date: nowIso
      }]);
    }
  }

  await supabaseAdmin.from('orders').update({
    payment_status: 'Authorized',
    updated_at: nowIso
  }).eq('id', order.id);

  await supabaseAdmin.from('order_timeline').insert([{
    order_id: order.id,
    event: 'Payment Authorized',
    note: `Razorpay payment authorized — awaiting capture${razorpayPaymentId ? ` (Payment ID: ${razorpayPaymentId})` : ''}`,
    created_by: 'system'
  }]);

  console.log(`🔐 Order ${order.id} payment authorized (awaiting capture).`);
}

serve(async (req) => {
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    const reqText = await req.text();
    let body;
    try { body = JSON.parse(reqText); } catch (e) { body = {}; }

    // --- Webhook Handling ---
    if (body.entity === 'event') {
      const signature = req.headers.get('x-razorpay-signature');
      if (!signature) return new Response('Missing signature', { status: 400, headers: cors });

      const isValid = await verifyWebhookSignature(reqText, signature);
      if (!isValid) return new Response('Invalid signature', { status: 400, headers: cors });

      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      if (body.event === 'payment.captured' || body.event === 'order.paid') {
        let razorpayOrderId = '';
        let razorpayPaymentId = '';

        if (body.event === 'payment.captured') {
          const payment = body.payload.payment.entity;
          razorpayOrderId = payment.order_id;
          razorpayPaymentId = payment.id;
        } else if (body.event === 'order.paid') {
          const order = body.payload.order.entity;
          razorpayOrderId = order.id;
          // For order.paid, we may not have payment ID directly
          razorpayPaymentId = body.payload.payment?.entity?.id || '';
        }

        if (razorpayOrderId) {
          await processPaymentCapture(supabaseAdmin, razorpayOrderId, razorpayPaymentId);
        }
      } else if (body.event === 'payment.failed') {
        // ── Payment failed: mark the order as failed + record the attempt ──
        const payment = body.payload?.payment?.entity || {};
        const razorpayOrderId = payment.order_id || '';
        const razorpayPaymentId = payment.id || '';
        const reason = payment.error_description || payment.error_code
          || payment.error_reason || 'Payment failed';

        if (razorpayOrderId) {
          await processPaymentFailure(supabaseAdmin, razorpayOrderId, razorpayPaymentId, reason, payment);
        }
      } else if (body.event === 'payment.authorized') {
        // ── Payment authorized but not yet captured (intermediate state) ──
        const payment = body.payload?.payment?.entity || {};
        const razorpayOrderId = payment.order_id || '';
        const razorpayPaymentId = payment.id || '';

        if (razorpayOrderId) {
          await processPaymentAuthorized(supabaseAdmin, razorpayOrderId, razorpayPaymentId, payment);
        }
      }

      return new Response('ok', { status: 200, headers: cors });
    }

    // --- Frontend API Handling ---
    const { action, amount, receipt, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (action === 'create_order') {
      if (!amount || amount <= 0 || !receipt) {
        return new Response(JSON.stringify({ error: 'Missing or invalid amount/receipt' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' }
        });
      }
      try {
        const order = await createRazorpayOrder(amount, receipt);
        return new Response(JSON.stringify({ order }), {
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        console.error('create_order failed:', err);
        // Surface a meaningful message so the frontend can show what went wrong
        // (e.g. missing keys, Razorpay API error) instead of a generic failure.
        const message = err?.message || 'Failed to create Razorpay order';
        return new Response(JSON.stringify({ error: message }), {
          status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
    }

    if (action === 'verify_payment') {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return new Response(JSON.stringify({ error: 'Missing payment details' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' }
        });
      }
      const isValid = await verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      return new Response(JSON.stringify({ success: isValid }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action or event' }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Function error:', error);
    // Return 200 so supabase-js doesn't swallow the error message
    return new Response(JSON.stringify({ error: `Edge Function crashed: ${error?.message}` }), {
      status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
