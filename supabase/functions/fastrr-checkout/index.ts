import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// V18: Restrict CORS to known origins instead of '*'.
const ALLOWED_ORIGINS = [
  'https://swadyum.store',
  'https://www.swadyum.store',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
];

function corsHeaders(req: Request) {
  const origin = req.headers.get('Origin');
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}

serve(async (req) => {
  const cors = corsHeaders(req);
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    const bodyObj = await req.json();
    console.log('Incoming Request Body:', JSON.stringify(bodyObj));

    // Support both the new frontend (raw_cart) and the old live frontend (cart_data.items)
    const raw_cart = bodyObj.raw_cart || (bodyObj.cart_data ? bodyObj.cart_data.items : []);
    const redirect_url = bodyObj.redirect_url;

    const apiKey = Deno.env.get('FASTRR_API_KEY');
    const secretKey = Deno.env.get('FASTRR_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!apiKey || !secretKey) {
      throw new Error('Fastrr API or Secret Key not configured in Supabase Secrets');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Map frontend cart (slug, weight) to database variant IDs
    const mappedItems = [];
    for (const item of raw_cart) {
      // The live frontend sends 'variant_id' as the slug, while new frontend sends 'slug'
      const itemSlug = item.slug || item.variant_id;
      // The old frontend didn't send weight, so we might need to match the first variant if weight is missing

      const { data: p, error: pError } = await supabase
        .from('products')
        .select('id, product_variants(id, weight_label)')
        .eq('slug', itemSlug)
        .single();

      if (!p || pError) throw new Error(`Product not found for slug: ${itemSlug}`);

      let variant;
      if (item.weight) {
        variant = p.product_variants.find((v: any) => v.weight_label === item.weight);
      } else {
        // Fallback to the first variant if weight is not provided by the old frontend
        variant = p.product_variants[0];
      }

      if (!variant) throw new Error(`Variant not found for item: ${itemSlug}`);

      mappedItems.push({
        variant_id: variant.id,
        quantity: item.quantity
      });
    }

    const payload = {
      cart_data: { items: mappedItems },
      redirect_url: redirect_url || "https://swadyum.store",
      timestamp: new Date().toISOString()
    };

    const payloadStr = JSON.stringify(payload);

    // Calculate HMAC SHA256 using Web Crypto API
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
      encoder.encode(payloadStr)
    );
    const hmac = arrayBufferToBase64(signature);

    // Call Shiprocket API
    const response = await fetch('https://checkout-api.shiprocket.com/api/v1/access-token/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'X-Api-HMAC-SHA256': hmac
      },
      body: payloadStr
    });

    const data = await response.json();
    console.log('Shiprocket Response Status:', response.status);
    console.log('Shiprocket Response Data:', JSON.stringify(data));

    if (!response.ok) {
      // V17: do not leak upstream details to the client.
      return new Response(JSON.stringify({ error: 'Failed to generate Fastrr token.' }), {
        status: 502,
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('Edge Function Error:', err);
    // V17: do not leak internal error details to the client.
    return new Response(JSON.stringify({ error: 'An unexpected error occurred.' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });
  }
});
