import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const { cart_data, redirect_url } = await req.json();
    const apiKey = Deno.env.get('FASTRR_API_KEY');
    const secretKey = Deno.env.get('FASTRR_SECRET_KEY');

    if (!apiKey || !secretKey) {
      throw new Error('Fastrr API or Secret Key not configured in Supabase Secrets');
    }

    const payload = {
      cart_data,
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
    
    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.message || 'Failed to generate Fastrr token' }), {
        status: response.status,
        headers: corsHeaders
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: corsHeaders
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
