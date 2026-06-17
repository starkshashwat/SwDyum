// Supabase Edge Function: shiprocket-sync
// Deploy using: supabase functions deploy shiprocket-sync

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 1. Initialize Supabase Client with Admin credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Fetch Order details from Supabase orders table
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: `Order ${orderId} not found: ${orderError?.message}` }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 3. Authenticate with Shiprocket API
    const shiprocketEmail = Deno.env.get('SHIPROCKET_EMAIL');
    const shiprocketPassword = Deno.env.get('SHIPROCKET_PASSWORD');

    if (!shiprocketEmail || !shiprocketPassword) {
      return new Response(JSON.stringify({ error: "Shiprocket credentials env variables not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const authResponse = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: shiprocketEmail,
        password: shiprocketPassword
      })
    });

    if (!authResponse.ok) {
      const authError = await authResponse.text();
      return new Response(JSON.stringify({ error: `Shiprocket auth failed: ${authError}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { token } = await authResponse.json();

    // 4. Map Order Items & Shipping Address to Shiprocket Payload
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    const shippingDetails = typeof order.shipping_details === 'string' ? JSON.parse(order.shipping_details) : order.shipping_details;

    const names = shippingDetails.name.trim().split(/\s+/);
    const firstName = names[0] || 'Valued';
    const lastName = names.slice(1).join(' ') || 'Customer';

    const orderItems = items.map((item: any) => ({
      name: item.name,
      sku: `SWD-${item.slug.toUpperCase().substring(0, 10)}-${item.weight}`,
      units: item.quantity,
      selling_price: String(item.price)
    }));

    // Estimate box parameters
    const totalQty = items.reduce((sum: number, i: any) => sum + i.quantity, 0);
    const estimatedWeight = totalQty * 0.5; // average 0.5kg per jar details

    const shiprocketPayload = {
      order_id: order.id,
      order_date: new Date(order.date).toISOString().replace(/T/, ' ').substring(0, 16),
      pickup_location: "Patna Warehouse",
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: shippingDetails.address,
      billing_city: shippingDetails.city,
      billing_pincode: shippingDetails.zip,
      billing_state: shippingDetails.state,
      billing_country: "India",
      billing_email: "support@swadyum.com", // dummy placeholder
      billing_phone: "9876543210", // dummy placeholder
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: order.payment_method === 'Cash on Delivery' ? 'COD' : 'Prepaid',
      sub_total: order.subtotal,
      length: 15,
      width: 15,
      height: 15,
      weight: estimatedWeight
    };

    // 5. Create shipment on Shiprocket
    const syncResponse = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(shiprocketPayload)
    });

    const syncData = await syncResponse.json();

    if (!syncResponse.ok || syncData.status_code !== 1) {
      return new Response(JSON.stringify({ 
        error: "Shiprocket order sync failed", 
        details: syncData 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 6. Update local order row in database with tracking details
    const awbCode = syncData.awb_code || `SR-AWB-${syncData.shipment_id || Math.floor(Math.random()*900000+100000)}`;
    const courierName = syncData.courier_name || "BlueDart Express";

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'Processing',
        tracking_id: awbCode,
        courier_name: courierName
      })
      .eq('id', order.id);

    return new Response(JSON.stringify({ 
      success: true, 
      shiprocket_order_id: syncData.order_id,
      shipment_id: syncData.shipment_id,
      tracking_id: awbCode,
      courier_name: courierName,
      db_update_error: updateError?.message || null
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
