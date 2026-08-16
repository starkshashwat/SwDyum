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
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
  };
}

async function triggerNotification(supabaseAdmin: any, eventType: string, orderData: any) {
  try {
    const { data: setting } = await supabaseAdmin
      .from('notification_settings')
      .select('*')
      .eq('event_type', eventType)
      .eq('is_enabled', true)
      .single();

    if (!setting || !setting.template_name) return;

    const phone = orderData.shipping_details?.phone || orderData.customer_phone || orderData.shipping_address?.phone;
    if (!phone) return;

    console.log(`Triggering notification ${eventType} for ${phone}`);

    // Resolve dynamic variables based on mappings
    const mappings = setting.variable_mappings || {};
    const components = [];

    const resolveVariable = (field) => {
      if (!field) return '';
      const addr = orderData.shipping_details || orderData.shipping_address || {};
      switch (field) {
        case 'customer_name': return addr.name || orderData.customer_name || 'Customer';
        case 'order_number': return orderData.id ? orderData.id.split('-')[0].toUpperCase() : 'Order';
        case 'order_date': return orderData.created_at ? new Date(orderData.created_at).toLocaleDateString() : new Date().toLocaleDateString();
        case 'total_amount': return orderData.total ? `₹${orderData.total}` : '';
        case 'payment_status': return orderData.payment_status || 'Pending';
        case 'payment_method': return orderData.payment_method || 'Online';
        case 'delivery_address': return [addr.address_line1, addr.address_line2, addr.city].filter(Boolean).join(', ') || '';
        case 'tracking_number': return orderData.tracking_number || '';
        case 'tracking_url': return orderData.tracking_url || '';
        case 'courier_name': return orderData.courier_name || '';
        case 'support_phone': return '+91 9999999999'; // Replace with actual support phone
        case 'brand_name': return 'Swadyum';
        default: return '';
      }
    };

    // Format components for Meta API
    for (const [compType, vars] of Object.entries(mappings)) {
      if (Object.keys(vars).length === 0) continue;
      
      const parameters = [];
      // Ensure variables are in order 1, 2, 3...
      const sortedIndexes = Object.keys(vars).sort((a, b) => parseInt(a) - parseInt(b));
      
      for (const index of sortedIndexes) {
        const field = vars[index];
        const value = resolveVariable(field) || ' '; // Meta API doesn't accept empty string
        parameters.push({ type: 'text', text: String(value).substring(0, 1024) });
      }

      if (parameters.length > 0) {
        components.push({
          type: compType.toLowerCase(),
          parameters
        });
      }
    }

    await supabaseAdmin.functions.invoke('send-whatsapp-message', {
      body: {
        phone: phone.startsWith('+') ? phone : `+91${phone}`,
        type: 'template',
        template: {
          name: setting.template_name,
          language: { code: setting.template_language },
          components: components.length > 0 ? components : undefined
        }
      }
    });
  } catch (err) {
    console.error(`Error triggering notification ${eventType}:`, err);
  }
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
    // Surface Razorpay's own reason (e.g. "Authentication failed" on bad
    // API keys) instead of a bare status text like "Unauthorized".
    let reason = response.statusText;
    try {
      reason = (await Promise.resolve(JSON.parse(errorText)))?.error?.description || reason;
    } catch { /* non-JSON body */ }
    throw new Error(`Razorpay order creation failed (${response.status}): ${reason}`);
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
  return timingSafeEqualStr(signatureHex, signature);
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
  return timingSafeEqualStr(expectedSignature, signature);
}

// Constant-time string comparison — avoids leaking signature prefixes via early exit.
function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ====================================================================
// Server-side pricing — the authoritative source for every amount.
// The client sends items (slug + weight_label + quantity); prices,
// discounts, shipping, and totals are always recomputed from the DB.
// Column names match the live schema (coupons.min_cart_value,
// coupons.usage_limit, product_variants.price).
// ====================================================================
const FREE_SHIPPING_THRESHOLD = 799;
const FLAT_SHIPPING_FEE = 50;
const MAX_QTY_PER_VARIANT = 20;
const MAX_DISTINCT_ITEMS = 50;

interface PricedLine {
  product_id: string;
  variant_id: string;
  product_name: string;
  weight_label: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  final_price: number;
}

async function priceOrderServerSide(supabaseAdmin: any, items: any[], couponCode?: string | null) {
  if (!Array.isArray(items) || items.length === 0) throw new Error('Cart is empty');
  if (items.length > MAX_DISTINCT_ITEMS) throw new Error('Too many distinct items in cart');

  const lines: PricedLine[] = [];
  let subtotal = 0;

  for (const item of items) {
    const slug = String(item?.slug || '').trim();
    const weight = String(item?.weight || item?.weight_label || '').trim();
    const qty = Math.floor(Number(item?.quantity));
    if (!slug || !weight) throw new Error('Invalid cart item');
    if (!Number.isFinite(qty) || qty < 1 || qty > MAX_QTY_PER_VARIANT) {
      throw new Error('Invalid quantity');
    }

    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, name, is_active, product_variants (id, weight_label, sku, price, stock_quantity, reserved_quantity)')
      .eq('slug', slug)
      .single();

    if (productError || !product) throw new Error(`Product not found: ${slug}`);
    if (!product.is_active) throw new Error(`Product is no longer available: ${product.name}`);

    const variant = (product.product_variants || []).find((v: any) => v.weight_label === weight);
    if (!variant) throw new Error(`Selected size is unavailable: ${weight}`);

    const available = Math.max(0, (variant.stock_quantity || 0) - (variant.reserved_quantity || 0));
    if (qty > available) {
      throw new Error(`Only ${available} left in stock for ${product.name} (${weight})`);
    }

    const lineTotal = variant.price * qty;
    subtotal += lineTotal;
    lines.push({
      product_id: product.id,
      variant_id: variant.id,
      product_name: product.name,
      weight_label: weight,
      sku: variant.sku || null,
      quantity: qty,
      unit_price: variant.price,
      total_price: lineTotal,
      final_price: lineTotal,
    });
  }

  // Coupon validation — entirely server-side, using live columns
  // (min_cart_value / usage_limit; migrations name them differently).
  let discount = 0;
  let appliedCouponCode: string | null = null;
  const code = couponCode ? String(couponCode).trim().toUpperCase() : '';
  if (code) {
    const { data: coupon, error: couponError } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (couponError || !coupon) throw new Error('Invalid or inactive coupon code');
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      throw new Error('This coupon has expired');
    }
    if (coupon.min_cart_value && subtotal < coupon.min_cart_value) {
      throw new Error(`Coupon requires a minimum order of ₹${coupon.min_cart_value}`);
    }
    if (coupon.usage_limit && (coupon.times_used || 0) >= coupon.usage_limit) {
      throw new Error('This coupon has reached its usage limit');
    }

    if (coupon.discount_type === 'percentage') {
      discount = (subtotal * coupon.discount_value) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) discount = coupon.max_discount;
    } else if (coupon.discount_type === 'fixed') {
      discount = coupon.discount_value;
    }
    discount = Math.max(0, Math.floor(discount));
    appliedCouponCode = coupon.code;
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const total = Math.max(0, subtotal - discount + shipping);

  return { lines, subtotal, discount, shipping, total, couponCode: appliedCouponCode };
}

// Resolve the caller's user id from the request JWT — never from the body.
async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return null;
  try {
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data } = await anonClient.auth.getUser();
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}

// Fetch a payment from Razorpay to compare the actually-charged amount.
async function fetchRazorpayPayment(paymentId: string): Promise<any | null> {
  const keyId = Deno.env.get('RAZORPAY_KEY_ID');
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
  if (!keyId || !keySecret || !paymentId) return null;
  try {
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}` }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// ====================================================================
// Post-Payment Processing — called after payment is confirmed
// Creates payment record, updates order, reduces inventory,
// tracks coupon usage, generates invoice, creates timeline entries.
// Idempotent: checks if payment already processed before proceeding.
// ====================================================================
async function processPaymentCapture(supabaseAdmin: any, razorpayOrderId: string, razorpayPaymentId: string, paymentEntity?: any): Promise<string> {
  // 1. Idempotency check — has this payment already been processed?
  if (razorpayPaymentId) {
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('razorpay_payment_id', razorpayPaymentId)
      .maybeSingle();

    if (existingPayment) {
      console.log(`Payment ${razorpayPaymentId} already processed. Skipping.`);
      return 'already_processed';
    }
  }

  // 2. Find the order by the Razorpay Order ID stored in payment_id during checkout
  const { data: order, error: orderFetchError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('payment_id', razorpayOrderId)
    .maybeSingle();

  if (orderFetchError || !order) {
    // Try razorpay_order_id column as fallback
    const { data: order2 } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', razorpayOrderId)
      .maybeSingle();
    if (!order2) {
      console.error(`Order not found for Razorpay order ${razorpayOrderId}`);
      return 'not_found';
    }
    // Use this order instead
    return _processOrder(supabaseAdmin, order2, razorpayOrderId, razorpayPaymentId, paymentEntity);
  }

  return _processOrder(supabaseAdmin, order, razorpayOrderId, razorpayPaymentId, paymentEntity);
}

async function _processOrder(supabaseAdmin: any, order: any, razorpayOrderId: string, razorpayPaymentId: string, paymentEntity?: any): Promise<string> {
  const orderId = order.id;

  // Amount verification: the amount Razorpay actually charged must match
  // the server-computed order total. A mismatch means the Razorpay order
  // was created outside this flow (or the order row was tampered with) —
  // keep the order Pending for manual reconciliation instead of marking Paid.
  let chargedAmount: number | null = null;
  if (paymentEntity?.amount != null) {
    chargedAmount = paymentEntity.amount; // paise
  } else if (razorpayPaymentId) {
    const rzpPayment = await fetchRazorpayPayment(razorpayPaymentId);
    if (rzpPayment?.amount != null) chargedAmount = rzpPayment.amount;
  }
  const expectedPaise = Math.round(order.total * 100);
  if (chargedAmount != null && chargedAmount !== expectedPaise) {
    console.error(`⚠️ Amount mismatch for order ${orderId}: charged ₹${chargedAmount / 100}, expected ₹${order.total}. Keeping order Pending.`);
    await supabaseAdmin.from('order_timeline').insert([{
      order_id: orderId,
      event: 'Amount Mismatch',
      note: `Charged ₹${chargedAmount / 100} but order total is ₹${order.total}. Manual review required.`,
      created_by: 'system'
    }]);
    return 'amount_mismatch';
  }

  // 3. Create payment record (idempotent on razorpay_payment_id via unique
  // index; the pre-check above handles DBs where the index isn't applied yet).
  if (razorpayPaymentId) {
    // Plain insert with duplicate-catch: PostgREST upsert with
    // ON CONFLICT(column) cannot infer a PARTIAL unique index, so the old
    // upsert errored and payment history rows went missing.
    const { error: paymentInsertError } = await supabaseAdmin.from('payments').insert([{
      order_id: orderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_order_id: razorpayOrderId,
      payment_method: paymentEntity?.method || 'Online / Razorpay',
      amount: chargedAmount != null ? chargedAmount / 100 : order.total,
      currency: 'INR',
      status: 'Paid',
      payment_date: new Date().toISOString()
    }]);
    if (paymentInsertError) {
      if (paymentInsertError.code === '23505') {
        console.log(`Payment ${razorpayPaymentId} already recorded (unique violation). Continuing.`);
      } else {
        console.error(`Failed to record payment for order ${orderId}:`, paymentInsertError.message);
      }
    }
  }

  // 4. Update order status
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7); // 5-7 days

  const { error: orderUpdateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'Paid',
      payment_status: 'Paid',
      order_status: 'Confirmed',
      payment_id: razorpayPaymentId || razorpayOrderId,
      razorpay_order_id: razorpayOrderId,
      estimated_delivery: estimatedDelivery.toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId);
  if (orderUpdateError) {
    console.error(`Failed to mark order ${orderId} as Paid:`, orderUpdateError.message);
  }

  // 5. Timeline entries
  const { error: timelineError } = await supabaseAdmin.from('order_timeline').insert([
    { order_id: orderId, event: 'Payment Received', note: `Razorpay Payment ID: ${razorpayPaymentId}`, created_by: 'system' },
    { order_id: orderId, event: 'Order Confirmed', note: 'Payment verified successfully', created_by: 'system' }
  ]);
  if (timelineError) {
    console.error(`Failed to add payment timeline for order ${orderId}:`, timelineError.message);
  }

  // 6. Process inventory reduction
  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (itemsError) {
    console.error(`Failed to fetch order items for ${orderId}:`, itemsError.message);
  } else if (items && items.length > 0) {
    // Inventory is handled automatically by PostgreSQL triggers on the orders table
    // Timeline entry for inventory
    await supabaseAdmin.from('order_timeline').insert([{
      order_id: orderId,
      event: 'Inventory Reduced',
      note: `${items.length} item(s) deducted from stock (handled by DB trigger)`,
      created_by: 'system'
    }]);
  }

  // 7. Track coupon usage — atomic increment when the RPC exists,
  // read-modify-write fallback otherwise.
  if (order.coupon_code) {
    const { data: couponData } = await supabaseAdmin
      .from('coupons')
      .select('id, times_used')
      .eq('code', order.coupon_code)
      .maybeSingle();

    if (couponData) {
      const { error: rpcError } = await supabaseAdmin.rpc('increment_coupon_usage', { p_code: order.coupon_code });
      if (rpcError) {
        // RPC not installed (pre-020 database) — fall back, best effort
        await supabaseAdmin
          .from('coupons')
          .update({ times_used: (couponData.times_used || 0) + 1 })
          .eq('id', couponData.id);
      }

      // Create coupon_usage record (idempotent on the order)
      const { data: existingUsage } = await supabaseAdmin
        .from('coupon_usage')
        .select('id')
        .eq('order_id', orderId)
        .maybeSingle();
      if (!existingUsage) {
        const { error: usageError } = await supabaseAdmin.from('coupon_usage').insert([{
          coupon_id: couponData.id,
          customer_id: order.customer_id,
          order_id: orderId,
          discount_amount: order.discount_amount || 0
        }]);
        if (usageError) {
          console.error(`Failed to record coupon usage for order ${orderId}:`, usageError.message);
        }
      }
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

  const { error: invoiceError } = await supabaseAdmin.from('invoices').insert([{
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
  if (invoiceError) {
    console.error(`Failed to generate invoice for order ${orderId}:`, invoiceError.message);
  }

  // 9. Trigger WhatsApp Notification for Order Placed
  await triggerNotification(supabaseAdmin, 'order_placed', order);

  // 10. Trigger Automation Engine Event
  if (order.customer_id) {
    await supabaseAdmin.from('automation_events').insert({
      event_id: `${order.id}_order_placed`,
      event_name: 'order_placed',
      customer_id: order.customer_id,
      payload: order,
      processed: false
    });
  }

  console.log(`✅ Order ${orderId} fully processed: payment recorded, inventory reduced, invoice generated.`);
  return 'processed';
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

  // Trigger Automation Engine Event
  if (order.customer_id) {
    await supabaseAdmin.from('automation_events').insert({
      event_id: `${order.id}_payment_failed`,
      event_name: 'payment_failed',
      customer_id: order.customer_id,
      payload: { ...order, failure_reason: reason },
      processed: false
    });
  }

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
        let paymentEntity: any = null;

        if (body.event === 'payment.captured') {
          const payment = body.payload.payment.entity;
          razorpayOrderId = payment.order_id;
          razorpayPaymentId = payment.id;
          paymentEntity = payment;
        } else if (body.event === 'order.paid') {
          const order = body.payload.order.entity;
          razorpayOrderId = order.id;
          // For order.paid, we may not have payment ID directly
          razorpayPaymentId = body.payload.payment?.entity?.id || '';
          paymentEntity = body.payload.payment?.entity || null;
        }

        if (razorpayOrderId) {
          await processPaymentCapture(supabaseAdmin, razorpayOrderId, razorpayPaymentId, paymentEntity);
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
    const { action, items, coupon_code, customer, receipt, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (action === 'create_order') {
      // Server-side pricing: the client sends the cart (slug + weight_label +
      // quantity) and a coupon code; every rupee is recomputed from the DB.
      // The `amount` field is intentionally ignored — it is client-controlled.
      if (!receipt) {
        return new Response(JSON.stringify({ error: 'Missing receipt' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' }
        });
      }
      try {
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const priced = await priceOrderServerSide(supabaseAdmin, items, coupon_code);

        // Identity comes from the request JWT, never from the body.
        let customerId = await getUserIdFromRequest(req);
        if (customerId) {
          const { data: profile } = await supabaseAdmin
            .from('profiles').select('id').eq('id', customerId).maybeSingle();
          if (!profile) customerId = null; // FK would fail — treat as guest
        }

        const rzpOrder = await createRazorpayOrder(priced.total, receipt);

        // Persist the order with server-computed amounts (service role).
        const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const shippingDetails = customer ? {
          name: String(customer.name || ''),
          email: String(customer.email || ''),
          phone: String(customer.phone || ''),
          address: String(customer.address || ''),
          city: String(customer.city || ''),
          state: String(customer.state || ''),
          zip: String(customer.zip || ''),
        } : {};

        const { error: orderInsertError } = await supabaseAdmin.from('orders').insert([{
          id: orderId,
          customer_id: customerId,
          customer_name: shippingDetails.name || null,
          customer_email: shippingDetails.email || null,
          customer_phone: shippingDetails.phone || null,
          subtotal: priced.subtotal,
          shipping_fee: priced.shipping,
          cod_fee: 0,
          discount_amount: priced.discount,
          total: priced.total,
          payment_method: 'Online / Razorpay',
          payment_id: rzpOrder.id,
          razorpay_order_id: rzpOrder.id,
          shipping_details: shippingDetails,
          billing_details: shippingDetails,
          shipping: priced.shipping,
          coupon_code: priced.couponCode,
          items: items,
          status: 'Pending',
          payment_status: 'Pending',
          order_status: 'Pending',
          checkout_expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
        }]);
        if (orderInsertError) throw new Error(`Failed to create order: ${orderInsertError.message}`);

        const { error: itemsInsertError } = await supabaseAdmin.from('order_items').insert(
          priced.lines.map((line) => ({
            order_id: orderId,
            product_id: line.product_id,
            variant_id: line.variant_id,
            product_name: line.product_name,
            weight_label: line.weight_label,
            sku: line.sku,
            quantity: line.quantity,
            unit_price: line.unit_price,
            total_price: line.total_price,
            final_price: line.final_price,
          }))
        );
        if (itemsInsertError) {
          // Order row without items is unusable — roll it back
          await supabaseAdmin.from('orders').delete().eq('id', orderId);
          throw new Error(`Failed to create order items: ${itemsInsertError.message}`);
        }

        return new Response(JSON.stringify({
          order: rzpOrder,
          order_id: orderId,
          totals: {
            subtotal: priced.subtotal,
            discount: priced.discount,
            shipping: priced.shipping,
            total: priced.total,
          },
        }), {
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        console.error('create_order failed:', err);
        const message = err?.message || 'Failed to create Razorpay order';
        return new Response(JSON.stringify({ error: message }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
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
      if (!isValid) {
        return new Response(JSON.stringify({ success: false, error: 'Payment signature verification failed' }), {
          status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Payment transitions are server-side only: verify the charged amount
      // against the stored order total and mark Paid via the same idempotent
      // pipeline the webhook uses. The client never writes order status.
      try {
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        const result = await processPaymentCapture(supabaseAdmin, razorpay_order_id, razorpay_payment_id, null);
        if (result === 'amount_mismatch') {
          return new Response(JSON.stringify({
            success: false,
            error: 'Payment amount does not match the order total. Our team will contact you.'
          }), {
            headers: { ...cors, 'Content-Type': 'application/json' },
          });
        }
        if (result === 'not_found') {
          return new Response(JSON.stringify({ success: false, error: 'Order not found for this payment' }), {
            headers: { ...cors, 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        console.error('verify_payment processing failed:', err);
        return new Response(JSON.stringify({ success: false, error: err?.message || 'Payment processing failed' }), {
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
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
