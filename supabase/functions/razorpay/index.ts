import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: receipt
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Razorpay Error:', errorText);
    throw new Error(`Failed to create order: ${response.statusText}`);
  }

  return await response.json();
}

async function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
  
  if (!keySecret) {
    throw new Error('Razorpay key secret is missing');
  }

  const data = `${orderId}|${paymentId}`;
  
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(keySecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(data)
  );

  const signatureHex = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return signatureHex === signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, amount, receipt, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (action === 'create_order') {
      if (!amount || !receipt) {
        return new Response(JSON.stringify({ error: 'Missing amount or receipt' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const order = await createRazorpayOrder(amount, receipt);
      
      return new Response(JSON.stringify({ order }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'verify_payment') {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
         return new Response(JSON.stringify({ error: 'Missing payment details' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const isValid = await verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      
      return new Response(JSON.stringify({ success: isValid }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
