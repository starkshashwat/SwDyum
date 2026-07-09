import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";

// Helper function to encode strings for HMAC
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// V18: Webhooks are called by Shiprocket servers, not browsers. Restrict CORS
// and do not reflect arbitrary origins.
const WEBHOOK_CORS = {
  'Access-Control-Allow-Origin': 'https://checkout-api.shiprocket.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-hmac-sha256',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: WEBHOOK_CORS });
  }

  try {
    const rawBodyText = await req.text();

    const secretKey = Deno.env.get('FASTRR_SECRET_KEY');
    const providedSignature = req.headers.get('x-api-hmac-sha256');

    if (secretKey && providedSignature) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secretKey),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(rawBodyText)
      );
      const calculatedSignature = arrayBufferToBase64(signature);

      if (calculatedSignature !== providedSignature) {
        console.warn(`⚠️ Shiprocket Order Webhook HMAC mismatch!`);
        return new Response(JSON.stringify({ error: 'Invalid HMAC signature' }), {
          status: 401,
          headers: { ...WEBHOOK_CORS, 'Content-Type': 'application/json' }
        });
      }
    }

    const orderData = JSON.parse(rawBodyText);
    const { order_id, status, cart_data, shipping_address, payments } = orderData;

    if (!order_id) {
      return new Response('OK', { status: 200, headers: WEBHOOK_CORS });
    }

    // Initialize Supabase with Service Role Key to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Supabase URL or Service Role Key not configured.');
      return new Response('Supabase config missing', { status: 500, headers: WEBHOOK_CORS });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`📥 Received Order Webhook from Shiprocket: ${order_id} [${status}]`);

    // Check if order already exists
    const { data: existingOrder } = await supabase.from('orders').select('id').eq('id', order_id).single();

    if (existingOrder) {
      console.log(`📦 Order ${order_id} already exists, updating status to ${status}`);
      await supabase.from('orders').update({
        status: status === 'SUCCESS' ? 'Paid' : (status === 'INITIATED' ? 'Pending' : 'Failed')
      }).eq('id', order_id);
      return new Response('OK', { status: 200, headers: WEBHOOK_CORS });
    }

    console.log(`✨ Creating new order ${order_id} from webhook...`);

    let total = 0;
    if (payments && payments.length > 0) {
      total = payments.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
    } else {
      total = orderData.total_amount_payable || orderData.subtotal_price || 0;
    }

    const newOrder = {
      id: order_id,
      user_id: null,
      total_amount: total,
      status: status === 'SUCCESS' ? 'Paid' : (status === 'INITIATED' ? 'Pending' : 'Failed'),
      payment_method: payments?.[0]?.method || 'Fastrr',
      shipping_address: shipping_address ? `${shipping_address.address1}, ${shipping_address.city}, ${shipping_address.state} - ${shipping_address.zip}` : null,
      contact_email: shipping_address?.email || null,
      contact_phone: shipping_address?.phone || null
    };

    const { error: insertOrderError } = await supabase.from('orders').insert([newOrder]);

    if (insertOrderError) {
      console.error('❌ Failed to insert order:', insertOrderError);
      return new Response('Failed to insert order', { status: 500, headers: WEBHOOK_CORS });
    }

    if (cart_data?.items && cart_data.items.length > 0) {
      const orderItems = cart_data.items.map((item: any) => ({
        order_id: order_id,
        product_id: null, // Depending on if we can map variant_id to product_id
        variant_id: item.variant_id || item.sku,
        quantity: item.quantity,
        price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) {
        console.error(`❌ Failed to insert order items for ${order_id}:`, itemsError);
      } else {
        console.log(`✅ Order ${order_id} and items successfully stored.`);
      }
    }

    return new Response('OK', { status: 200, headers: WEBHOOK_CORS });

  } catch (err: any) {
    console.error('❌ Order Webhook Error:', err);
    // V17: do not leak internal error details to the caller.
    return new Response(JSON.stringify({ error: 'Webhook processing failed.' }), {
      status: 500,
      headers: { ...WEBHOOK_CORS, 'Content-Type': 'application/json' }
    });
  }
});
