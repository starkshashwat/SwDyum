// Isolates the "Unauthorized" failure: performs the exact orders insert the
// edge function does, using the backend's known-good service key, then
// cleans up. If this works, the edge function's SUPABASE_SERVICE_ROLE_KEY
// secret is stale/invalid.
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const orderId = `ORD-PROBE-${Date.now()}`;

// 1. SELECT (works in the edge function)
const { data: prod, error: selErr } = await supabase
  .from('products')
  .select('id, slug, product_variants (id, weight_label, price, stock_quantity, reserved_quantity)')
  .eq('slug', 'mango-pickle')
  .single();
console.log('SELECT products:', selErr ? `ERROR ${selErr.message}` : `ok (${prod?.slug}, variants: ${prod?.product_variants?.length})`);

// 2. INSERT orders (the failing step)
const { error: insErr } = await supabase.from('orders').insert([{
  id: orderId,
  customer_id: null,
  customer_name: 'Probe',
  customer_email: 'probe@test.local',
  customer_phone: '9999999999',
  subtotal: 599,
  shipping_fee: 50,
  cod_fee: 0,
  discount_amount: 0,
  total: 649,
  payment_method: 'Online / Razorpay',
  payment_id: 'probe_rzp',
  razorpay_order_id: 'probe_rzp',
  shipping_details: { name: 'Probe' },
  billing_details: { name: 'Probe' },
  shipping: 50,
  coupon_code: null,
  items: [{ slug: 'mango-pickle', weight: '500g', quantity: 1 }],
  status: 'Pending',
  payment_status: 'Pending',
  order_status: 'Pending',
  checkout_expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  created_at: new Date().toISOString(),
}]);
console.log('INSERT orders:', insErr ? `ERROR ${insErr.message} (code ${insErr.code})` : 'ok');

// 3. INSERT order_items with variant_id (reservation trigger fires here)
if (!insErr) {
  const variant = prod?.product_variants?.find(v => v.weight_label === '500g');
  const { error: itemErr } = await supabase.from('order_items').insert([{
    order_id: orderId,
    product_id: prod?.id,
    variant_id: variant?.id,
    product_name: prod?.name || 'Mango Pickle',
    weight_label: '500g',
    sku: variant?.sku || null,
    quantity: 1,
    unit_price: variant?.price,
    total_price: variant?.price,
    final_price: variant?.price,
  }]);
  console.log('INSERT order_items:', itemErr ? `ERROR ${itemErr.message} (code ${itemErr.code})` : 'ok (reservation trigger ran)');

  // check the trigger actually reserved stock
  const { data: v2 } = await supabase
    .from('product_variants')
    .select('stock_quantity, reserved_quantity')
    .eq('id', variant?.id)
    .single();
  console.log('variant after insert:', JSON.stringify(v2));

  // 4. cleanup (deletes cascade order_items; release happens via log trigger? no — manual)
  const { error: delErr } = await supabase.from('orders').delete().eq('id', orderId);
  console.log('CLEANUP orders:', delErr ? `ERROR ${delErr.message}` : 'ok');
}
