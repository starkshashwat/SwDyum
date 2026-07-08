import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
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

async function verifyWebhookSignature(payloadText: string, signature: string) {
  const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
  if (!webhookSecret) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not set');
    return false;
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payloadText)
  );

  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return expectedSignature === signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const reqText = await req.text();
    let body;
    try {
      body = JSON.parse(reqText);
    } catch(e) {
      body = {};
    }

    // --- Webhook Handling ---
    if (body.entity === 'event') {
      const signature = req.headers.get('x-razorpay-signature');
      if (!signature) {
        return new Response('Missing signature', { status: 400 });
      }

      const isValid = await verifyWebhookSignature(reqText, signature);
      if (!isValid) {
        return new Response('Invalid signature', { status: 400 });
      }

      if (body.event === 'payment.captured' || body.event === 'order.paid') {
        // Initialize Supabase admin client to bypass RLS
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        let orderId, paymentId;

        if (body.event === 'payment.captured') {
          const payment = body.payload.payment.entity;
          orderId = payment.order_id;
          paymentId = payment.id;
        } else if (body.event === 'order.paid') {
          const order = body.payload.order.entity;
          orderId = order.id;
        }

        if (orderId) {
          const { error } = await supabaseAdmin
            .from('orders')
            .update({ status: 'Paid', payment_id: paymentId })
            .eq('payment_id', orderId);

          if (error) {
            console.error('Error updating order:', error);
            return new Response('Database error', { status: 500 });
          }
        }
      }
      
      // Always return 200 OK for valid webhooks to prevent Razorpay from retrying/disabling
      return new Response('ok', { status: 200, headers: corsHeaders });
    }

    // --- Frontend API Handling ---
    const { action, amount, receipt, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

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

    return new Response(JSON.stringify({ error: 'Invalid action or event' }), {
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
