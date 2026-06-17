// server.js — Swadyum Backend API Server
// Port 3001 | Handles: Razorpay payments + Shiprocket fulfillment
//
// ─── Correct Flow ──────────────────────────────────────────────────────────────
// Customer → Checkout Form → Razorpay Payment → Payment Verified on Server →
//   → Create Shiprocket Order → Assign AWB → Generate Label → Confirmation
//
// COD Flow: Checkout Form → Create Shiprocket Order → Assign AWB → Confirmation
// ────────────────────────────────────────────────────────────────────────────────

import express from 'express';
import cors from 'cors';
import { createHmac } from 'crypto';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load .env (ESM compatible) ───────────────────────────────────────────────
try {
  const envFile = readFileSync(resolve(__dirname, '.env'), 'utf-8');
  envFile.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        const val = trimmed.substring(eqIdx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  });
} catch {
  // .env not found — use system environment variables
}

const app = express();
const PORT = process.env.PROXY_PORT || 3001;
const SHIPROCKET_BASE = 'https://apiv2.shiprocket.in/v1/external';
const PICKUP_LOCATION = process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary';

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  methods: ['GET', 'POST', 'OPTIONS'],
}));
app.use(express.json());

// ═══════════════════════════════════════════════════════════════════════════════
// SHIPROCKET UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

let cachedToken = null;
let tokenExpiry = 0;

async function getShiprocketToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || email.includes('your_api_user_email')) {
    throw new Error('Shiprocket credentials not set. Update SHIPROCKET_EMAIL in .env');
  }

  console.log(`🔐 Authenticating with Shiprocket (${email})...`);

  const res = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!data.token) throw new Error(`Shiprocket auth failed: ${JSON.stringify(data)}`);

  cachedToken = data.token;
  tokenExpiry = Date.now() + 239 * 60 * 60 * 1000;
  console.log('✅ Shiprocket token acquired');
  return cachedToken;
}

async function shiprocketRequest(endpoint, options = {}) {
  const token = await getShiprocketToken();
  const res = await fetch(`${SHIPROCKET_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  return res.json();
}

// Full Shiprocket fulfillment: create order → assign AWB → generate label
async function fulfillWithShiprocket(orderId, orderData, shippingDetails, paymentMethod) {
  const names = (shippingDetails.name || '').trim().split(/\s+/);
  const firstName = names[0] || 'Valued';
  const lastName = names.slice(1).join(' ') || 'Customer';
  const phone = (shippingDetails.phone || '').replace(/\D/g, '').slice(-10) || '9876543210';

  const totalWeight = Math.max(
    0.1,
    (orderData.items || []).reduce((sum, item) => sum + item.quantity * 0.5, 0)
  );

  const payload = {
    order_id: String(orderId),
    order_date: new Date(orderData.date || Date.now())
      .toISOString()
      .replace('T', ' ')
      .substring(0, 16),
    pickup_location: PICKUP_LOCATION,

    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: shippingDetails.address,
    billing_city: shippingDetails.city,
    billing_pincode: String(shippingDetails.zip),
    billing_state: shippingDetails.state,
    billing_country: 'India',
    billing_email: shippingDetails.email || 'customer@swadyum.com',
    billing_phone: phone,
    shipping_is_billing: true,

    order_items: (orderData.items || []).map((item) => ({
      name: item.name,
      sku: `SWD-${(item.slug || 'PICKLE').substring(0, 6).toUpperCase()}-${item.weight}`,
      units: item.quantity,
      selling_price: String(item.price),
      discount: '',
      tax: '',
      hsn: 2001,
    })),

    payment_method: paymentMethod === 'COD' ? 'COD' : 'Prepaid',
    sub_total: orderData.subtotal || orderData.total,
    length: 15,
    breadth: 15,
    height: 15,
    weight: totalWeight,
  };

  // Step 1: Create Shiprocket Order
  console.log(`📦 Creating Shiprocket order: ${orderId}`);
  const createRes = await shiprocketRequest('/orders/create/adhoc', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!createRes.shipment_id) {
    console.warn('⚠️ Shiprocket create-order response:', createRes);
    return { error: createRes.message || 'Order creation failed', shiprocketRaw: createRes };
  }

  const shipmentId = createRes.shipment_id;
  const shiprocketOrderId = createRes.order_id;
  console.log(`✅ Shiprocket order: ${shiprocketOrderId} | Shipment: ${shipmentId}`);

  // Step 2: Assign AWB (wait 3s for Shiprocket to process)
  await new Promise((r) => setTimeout(r, 3000));
  console.log(`📬 Assigning AWB for shipment: ${shipmentId}`);

  const awbRes = await shiprocketRequest('/courier/assign/awb', {
    method: 'POST',
    body: JSON.stringify({ shipment_id: shipmentId }),
  });

  const awb = awbRes?.response?.data?.awb_code || awbRes?.awb_code || null;
  const courierName =
    awbRes?.response?.data?.courier_name || awbRes?.courier_name || 'Shiprocket Courier';

  if (awb) {
    console.log(`✅ AWB: ${awb} | Courier: ${courierName}`);
  } else {
    console.warn('⚠️ AWB response:', JSON.stringify(awbRes, null, 2));
  }

  // Step 3: Generate Shipping Label (wait 2s)
  let labelUrl = null;
  if (awb) {
    try {
      await new Promise((r) => setTimeout(r, 2000));
      const labelRes = await shiprocketRequest('/courier/generate/label', {
        method: 'POST',
        body: JSON.stringify({ shipment_id: [shipmentId] }),
      });
      labelUrl = labelRes?.label_url || labelRes?.others?.label_url || null;
      if (labelUrl) console.log('✅ Label URL generated');
    } catch (labelErr) {
      console.warn('⚠️ Label generation failed (non-critical):', labelErr.message);
    }
  }

  return { shipmentId, shiprocketOrderId, awb, courierName, labelUrl };
}

// ═══════════════════════════════════════════════════════════════════════════════
// RAZORPAY ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

// Step A: Create Razorpay Order (called before opening payment modal)
app.post('/api/payment/create-razorpay-order', async (req, res) => {
  try {
    const { amount, receipt } = req.body;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || keyId.includes('rzp_test_YOUR') || !keySecret || keySecret.includes('YOUR_KEY')) {
      // Dev mode: return a mock Razorpay order so the app doesn't crash
      console.warn('⚠️  Razorpay not configured — returning mock order (dev mode)');
      return res.json({
        razorpay_order_id: `mock_order_${Date.now()}`,
        amount: amount * 100,
        currency: 'INR',
        mock: true,
      });
    }

    console.log(`💳 Creating Razorpay order: ₹${amount} | Receipt: ${receipt}`);

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // paise
        currency: 'INR',
        receipt,
        notes: { source: 'Swadyum Pickles' },
      }),
    });

    const order = await response.json();
    if (!order.id) throw new Error(`Razorpay order error: ${JSON.stringify(order)}`);

    console.log(`✅ Razorpay order: ${order.id}`);
    res.json({
      razorpay_order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error('❌ Razorpay create-order error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// CORE: FULFILL ORDER ENDPOINT
// Called AFTER payment success (or directly for COD)
// Verifies Razorpay payment → Creates Shiprocket order → Assigns AWB
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/fulfill-order', async (req, res) => {
  try {
    const {
      orderId,
      orderData,
      shippingDetails,
      paymentMethod,                // 'COD' | 'Prepaid'
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // ── Step 1: Verify Razorpay Payment (skip for COD) ────────────────────────
    if (paymentMethod !== 'COD') {
      if (!razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Payment details missing for prepaid order.' });
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      // If secret is configured (not placeholder), verify the signature
      if (keySecret && !keySecret.includes('YOUR_KEY')) {
        const expectedSignature = createHmac('sha256', keySecret)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest('hex');

        if (expectedSignature !== razorpay_signature) {
          console.error('❌ Razorpay signature mismatch!');
          return res.status(400).json({
            error: 'Payment verification failed. Possible tampering detected.',
          });
        }
        console.log(`✅ Razorpay payment verified: ${razorpay_payment_id}`);
      } else {
        // Mock mode: signature starts with 'mock_' — skip verification
        if (!razorpay_payment_id.startsWith('mock_')) {
          console.warn('⚠️  Razorpay secret not configured — skipping signature verification');
        }
      }
    } else {
      console.log('📦 COD order — skipping payment verification');
    }

    // ── Step 2: Fulfill with Shiprocket ───────────────────────────────────────
    const shiprocketResult = await fulfillWithShiprocket(
      orderId,
      orderData,
      shippingDetails,
      paymentMethod
    );

    if (shiprocketResult.error) {
      // Shiprocket failed but payment is done — return partial success
      return res.json({
        success: true,
        paymentVerified: true,
        paymentId: razorpay_payment_id || null,
        shiprocketError: shiprocketResult.error,
        awb: null,
        courierName: null,
        labelUrl: null,
      });
    }

    // ── Step 3: Return full result ─────────────────────────────────────────────
    res.json({
      success: true,
      paymentVerified: paymentMethod !== 'COD',
      paymentId: razorpay_payment_id || null,
      ...shiprocketResult,
    });

  } catch (err) {
    console.error('❌ fulfill-order error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SHIPROCKET PASS-THROUGH ENDPOINTS (kept for tracking)
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/shiprocket/track/:awb', async (req, res) => {
  try {
    console.log('🔍 Tracking AWB:', req.params.awb);
    const data = await shiprocketRequest(`/courier/track/awb/${req.params.awb}`, { method: 'GET' });
    res.json(data);
  } catch (err) {
    console.error('❌ track error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const shiprocketReady =
    !!process.env.SHIPROCKET_EMAIL && !process.env.SHIPROCKET_EMAIL.includes('your_api_user_email');
  const razorpayReady =
    !!process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('rzp_test_YOUR');

  res.json({
    status: 'ok',
    message: '🥒 Swadyum API Server running',
    pickup_location: PICKUP_LOCATION,
    services: {
      shiprocket: shiprocketReady ? '✅ Configured' : '⚠️ Not configured',
      razorpay: razorpayReady ? '✅ Configured' : '⚠️ Not configured (mock mode)',
    },
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const shiprocketOk =
    process.env.SHIPROCKET_EMAIL && !process.env.SHIPROCKET_EMAIL.includes('your_api_user_email');
  const razorpayOk =
    process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('rzp_test_YOUR');

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🥒  Swadyum API Server  |  http://localhost:${PORT}`);
  console.log(`📍  Pickup Location  : ${PICKUP_LOCATION}`);
  console.log(`🚚  Shiprocket       : ${shiprocketOk ? '✅ ' + process.env.SHIPROCKET_EMAIL : '⚠️  Update SHIPROCKET_EMAIL in .env'}`);
  console.log(`💳  Razorpay         : ${razorpayOk ? '✅ ' + process.env.RAZORPAY_KEY_ID : '⚠️  Update RAZORPAY_KEY_ID in .env (mock mode active)'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('  Flow: Razorpay → verify → Shiprocket → AWB → Confirm');
  console.log('  COD Flow: Order → Shiprocket → AWB → Confirm');
  console.log('');
});
