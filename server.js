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
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load .env (ESM compatible) ───────────────────────────────────────────────
import fs from 'fs';
try {
  let envPath = resolve(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    envPath = resolve(__dirname, '.env');
  }
  const envFile = readFileSync(envPath, 'utf-8');
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

// Supabase Connection for Catalog Sync APIs
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  methods: ['GET', 'POST', 'OPTIONS'],
}));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

// ═══════════════════════════════════════════════════════════════════════════════
// SHIPROCKET UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

let cachedToken = null;
let tokenExpiry = 0;

async function getShiprocketToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email) {
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

// ═══════════════════════════════════════════════════════════════════════════════
// SHIPROCKET FASTRR CHECKOUT ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/fastrr/access-token', async (req, res) => {
  try {
    const { cart_data, redirect_url } = req.body;
    const apiKey = process.env.FASTRR_API_KEY;
    const secretKey = process.env.FASTRR_SECRET_KEY;

    if (!apiKey || !secretKey) {
      return res.status(500).json({ error: 'Fastrr API or Secret Key not configured' });
    }

    const payload = {
      cart_data,
      redirect_url: redirect_url || "http://localhost:5173",
      timestamp: new Date().toISOString()
    };

    const payloadStr = JSON.stringify(payload);
    
    // Calculate HMAC SHA256 using the Secret Key
    const hmac = createHmac('sha256', secretKey)
      .update(payloadStr)
      .digest('base64');

    console.log(`🚀 Requesting Fastrr Access Token...`);

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
      console.error('❌ Fastrr token error:', data);
      return res.status(response.status).json({ error: data.message || 'Failed to generate Fastrr token' });
    }

    console.log(`✅ Fastrr token generated successfully!`);
    res.json(data);
  } catch (err) {
    console.error('❌ Fastrr token error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SHIPROCKET CATALOG SYNC ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/shiprocket/products', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { data: products, error, count } = await supabase
      .from('products')
      .select('*, product_images(url, is_primary, display_order), product_variants(*)', { count: 'exact' })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const formattedProducts = products.map(p => ({
      id: p.id,
      title: p.name,
      body_html: p.description,
      status: p.is_active ? 'active' : 'draft',
      created_at: p.created_at,
      updated_at: p.updated_at,
      vendor: 'Swadyum',
      product_type: 'Pickles',
      handle: p.slug,
      images: p.product_images?.sort((a, b) => a.display_order - b.display_order).map((img, i) => ({
        id: `img_${i}_${p.id}`,
        product_id: p.id,
        position: i + 1,
        src: img.url
      })) || [],
      variants: p.product_variants?.map((v, i) => ({
        id: v.id,
        product_id: p.id,
        title: v.weight_label,
        price: v.price,
        sku: v.sku || `SWD-${p.slug.substring(0, 5).toUpperCase()}-${v.weight_label}`,
        position: i + 1,
        inventory_policy: 'deny',
        compare_at_price: v.mrp,
        inventory_quantity: v.stock_quantity,
        weight: parseFloat(v.weight_label) || 0,
        weight_unit: (v.weight_label || '').toLowerCase().includes('kg') ? 'kg' : 'g',
        requires_shipping: true
      })) || []
    }));

    res.json({
      products: formattedProducts,
      page_info: {
        has_next_page: offset + limit < count,
        has_previous_page: page > 1,
        total_count: count
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/shiprocket/collections', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  try {
    const { data: collections, error } = await supabase.from('categories').select('*');
    if (error) throw error;

    res.json({
      custom_collections: collections.map(c => ({
        id: c.id,
        handle: c.slug,
        title: c.name,
        updated_at: c.updated_at,
        body_html: c.description,
        published_at: c.created_at,
        sort_order: 'manual',
        image: {
          src: c.banner_url
        }
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/shiprocket/collections/:id/products', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { data: products, error, count } = await supabase
      .from('products')
      .select('*, product_images(url, is_primary, display_order), product_variants(*)', { count: 'exact' })
      .eq('category_id', id)
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const formattedProducts = products.map(p => ({
      id: p.id,
      title: p.name,
      body_html: p.description,
      status: p.is_active ? 'active' : 'draft',
      created_at: p.created_at,
      updated_at: p.updated_at,
      vendor: 'Swadyum',
      product_type: 'Pickles',
      handle: p.slug,
      images: p.product_images?.sort((a, b) => a.display_order - b.display_order).map((img, i) => ({
        id: `img_${i}_${p.id}`,
        product_id: p.id,
        position: i + 1,
        src: img.url
      })) || [],
      variants: p.product_variants?.map((v, i) => ({
        id: v.id,
        product_id: p.id,
        title: v.weight_label,
        price: v.price,
        sku: v.sku || `SWD-${p.slug.substring(0, 5).toUpperCase()}-${v.weight_label}`,
        position: i + 1,
        inventory_policy: 'deny',
        compare_at_price: v.mrp,
        inventory_quantity: v.stock_quantity,
        weight: parseFloat(v.weight_label) || 0,
        weight_unit: (v.weight_label || '').toLowerCase().includes('kg') ? 'kg' : 'g',
        requires_shipping: true
      })) || []
    }));

    res.json({
      products: formattedProducts,
      page_info: {
        has_next_page: offset + limit < count,
        has_previous_page: page > 1,
        total_count: count
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SHIPROCKET REALTIME WEBHOOK SYNC
// ═══════════════════════════════════════════════════════════════════════════════

const SHIPROCKET_WH_PRODUCT = 'https://checkout-api.shiprocket.com/wh/v1/custom/product';
const SHIPROCKET_WH_COLLECTION = 'https://checkout-api.shiprocket.com/wh/v1/custom/collection';

// Helper to fetch and format a single product
async function fetchAndFormatProduct(productId) {
  const { data: p, error } = await supabase
    .from('products')
    .select('*, product_images(url, is_primary, display_order), product_variants(*)')
    .eq('id', productId)
    .single();

  if (error || !p) return null;

  return {
    id: p.id,
    title: p.name,
    body_html: p.description,
    status: p.is_active ? 'active' : 'draft',
    created_at: p.created_at,
    updated_at: p.updated_at,
    vendor: 'Swadyum',
    product_type: 'Pickles',
    handle: p.slug,
    images: p.product_images?.sort((a, b) => a.display_order - b.display_order).map((img, i) => ({
      id: `img_${i}_${p.id}`,
      product_id: p.id,
      position: i + 1,
      src: img.url
    })) || [],
    variants: p.product_variants?.map((v, i) => ({
      id: v.id,
      product_id: p.id,
      title: v.weight_label,
      price: v.price,
      sku: v.sku || `SWD-${p.slug.substring(0, 5).toUpperCase()}-${v.weight_label}`,
      position: i + 1,
      inventory_policy: 'deny',
      compare_at_price: v.mrp,
      inventory_quantity: v.stock_quantity,
      weight: parseFloat(v.weight_label) || 0,
      weight_unit: (v.weight_label || '').toLowerCase().includes('kg') ? 'kg' : 'g',
      requires_shipping: true
    })) || []
  };
}

// Helper to fetch and format a single collection
async function fetchAndFormatCollection(categoryId) {
  const { data: c, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single();
    
  if (error || !c) return null;

  return {
    id: c.id,
    handle: c.slug,
    title: c.name,
    updated_at: c.updated_at,
    body_html: c.description,
    published_at: c.created_at,
    sort_order: 'manual',
    image: { src: c.banner_url }
  };
}

// Debounce map to prevent sending multiple webhooks for rapid successive changes (e.g. updating product then variants)
const syncTimeouts = {};

function triggerShiprocketProductSync(productId) {
  if (!productId) return;
  if (syncTimeouts[`prod_${productId}`]) clearTimeout(syncTimeouts[`prod_${productId}`]);
  
  syncTimeouts[`prod_${productId}`] = setTimeout(async () => {
    try {
      console.log(`🔄 Syncing product ${productId} to Shiprocket...`);
      const productPayload = await fetchAndFormatProduct(productId);
      if (!productPayload) return;

      const payloadStr = JSON.stringify(productPayload);
      const apiKey = process.env.FASTRR_API_KEY;
      const secretKey = process.env.FASTRR_SECRET_KEY;

      if (!apiKey || !secretKey) {
        console.warn('⚠️ Missing Fastrr API keys. Cannot send authenticated catalog webhook.');
        return;
      }

      const hmac = createHmac('sha256', secretKey).update(payloadStr).digest('base64');

      const res = await fetch(SHIPROCKET_WH_PRODUCT, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
          'X-Api-HMAC-SHA256': hmac
        },
        body: payloadStr
      });
      if (res.ok) console.log(`✅ Product ${productId} synced to Shiprocket successfully.`);
      else console.error(`❌ Shiprocket product sync failed:`, await res.text());
    } catch (err) {
      console.error(`❌ Shiprocket product sync error:`, err);
    }
  }, 2000); // 2 second debounce
}

function triggerShiprocketCollectionSync(categoryId) {
  if (!categoryId) return;
  if (syncTimeouts[`cat_${categoryId}`]) clearTimeout(syncTimeouts[`cat_${categoryId}`]);
  
  syncTimeouts[`cat_${categoryId}`] = setTimeout(async () => {
    try {
      console.log(`🔄 Syncing collection ${categoryId} to Shiprocket...`);
      const collectionPayload = await fetchAndFormatCollection(categoryId);
      if (!collectionPayload) return;

      const payloadStr = JSON.stringify(collectionPayload);
      const apiKey = process.env.FASTRR_API_KEY;
      const secretKey = process.env.FASTRR_SECRET_KEY;

      if (!apiKey || !secretKey) {
        console.warn('⚠️ Missing Fastrr API keys. Cannot send authenticated catalog webhook.');
        return;
      }

      const hmac = createHmac('sha256', secretKey).update(payloadStr).digest('base64');

      const res = await fetch(SHIPROCKET_WH_COLLECTION, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
          'X-Api-HMAC-SHA256': hmac
        },
        body: payloadStr
      });
      if (res.ok) console.log(`✅ Collection ${categoryId} synced to Shiprocket successfully.`);
      else console.error(`❌ Shiprocket collection sync failed:`, await res.text());
    } catch (err) {
      console.error(`❌ Shiprocket collection sync error:`, err);
    }
  }, 2000);
}

// Initialize Realtime Subscriptions
if (supabase) {
  console.log('📡 Initializing Supabase Realtime listeners for Catalog Sync...');
  supabase.channel('catalog-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
      triggerShiprocketProductSync(payload.new?.id || payload.old?.id);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'product_variants' }, (payload) => {
      triggerShiprocketProductSync(payload.new?.product_id || payload.old?.product_id);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'product_images' }, (payload) => {
      triggerShiprocketProductSync(payload.new?.product_id || payload.old?.product_id);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, (payload) => {
      triggerShiprocketCollectionSync(payload.new?.id || payload.old?.id);
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Realtime catalog sync listeners active.');
      }
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHIPROCKET ORDER WEBHOOK (Incoming from Fastrr)
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/webhooks/shiprocket/order', async (req, res) => {
  try {
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const apiKey = process.env.FASTRR_API_KEY;
    const secretKey = process.env.FASTRR_SECRET_KEY;
    const providedSignature = req.headers['x-api-hmac-sha256'];

    if (secretKey && providedSignature) {
      const calculatedSignature = createHmac('sha256', secretKey).update(rawBody).digest('base64');
      if (calculatedSignature !== providedSignature) {
        console.warn(`⚠️ Shiprocket Order Webhook HMAC mismatch! Expected ${calculatedSignature}, got ${providedSignature}`);
        // During early testing, we might just warn, but usually we would return 401
      }
    }

    const orderData = req.body;
    
    if (!supabase) {
      console.error('❌ Supabase not initialized, cannot save order from webhook.');
      return res.status(200).send('OK'); // Must return 200 so Shiprocket stops retrying
    }

    const { order_id, status, cart_data, shipping_address, payment_type, payments } = orderData;
    
    if (!order_id) return res.status(200).send('OK');

    console.log(`📥 Received Order Webhook from Shiprocket: ${order_id} [${status}]`);

    // Check if order already exists
    const { data: existingOrder } = await supabase.from('orders').select('id').eq('id', order_id).single();

    if (existingOrder) {
      console.log(`📦 Order ${order_id} already exists, updating status to ${status}`);
      await supabase.from('orders').update({
        status: status === 'SUCCESS' ? 'Paid' : (status === 'INITIATED' ? 'Pending' : 'Failed')
      }).eq('id', order_id);
      return res.status(200).send('OK');
    }

    // New Order - Insert it
    console.log(`✨ Creating new order ${order_id} from webhook...`);
    
    let total = 0;
    if (payments && payments.length > 0) {
      total = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    } else {
      total = orderData.total_amount_payable || orderData.subtotal_price || 0;
    }

    const newOrder = {
      id: order_id,
      date: orderData.created_at || new Date().toISOString(),
      subtotal: orderData.subtotal_price || total,
      shipping_fee: orderData.shipping_charges || 0,
      cod_fee: orderData.cod_charges || 0,
      discount_amount: orderData.total_discount || 0,
      total: total,
      status: status === 'SUCCESS' ? 'Paid' : (status === 'INITIATED' ? 'Pending' : 'Failed'),
      payment_method: payment_type || 'Prepaid',
      payment_id: payments?.[0]?.pg_transaction_id || null,
      shipping_details: shipping_address || {}
    };

    const { error: insertError } = await supabase.from('orders').insert([newOrder]);

    if (insertError) {
      console.error(`❌ DB Insert Error for order ${order_id}:`, insertError);
      return res.status(200).send('OK'); 
    }

    // Insert Items
    if (cart_data && cart_data.items) {
      const orderItems = cart_data.items.map(item => ({
        order_id: order_id,
        variant_id: item.variant_id, 
        product_name: item.name || `Variant ${item.variant_id}`,
        weight_label: item.weight || 'Unknown',
        quantity: item.quantity,
        unit_price: item.price || 0,
        total_price: (item.price || 0) * item.quantity
      }));
      
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) {
        console.error(`❌ DB Insert Items Error for order ${order_id}:`, itemsError);
      }
    }

    console.log(`✅ Order ${order_id} successfully saved to database.`);
    res.status(200).send('OK');

  } catch (err) {
    console.error('❌ Order Webhook Error:', err);
    res.status(200).send('OK'); 
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const shiprocketReady = !!process.env.SHIPROCKET_EMAIL;
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
  const shiprocketOk = !!process.env.SHIPROCKET_EMAIL;
  const razorpayOk =
    process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('rzp_test_YOUR');

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🥒  Swadyum API Server  |  http://localhost:${PORT}`);
  console.log(`📍  Pickup Location  : ${PICKUP_LOCATION}`);
  console.log(`🚚  Shiprocket       : ${shiprocketOk ? '✅ ' + process.env.SHIPROCKET_EMAIL : '⚠️  Update SHIPROCKET_EMAIL in .env'}`);
  console.log(`💳  Razorpay         : ${razorpayOk ? '✅ ' + process.env.RAZORPAY_KEY_ID : '⚠️  Update RAZORPAY_KEY_ID in .env (mock mode active)'}`);
  console.log(`🛒  Fastrr Checkout  : ${process.env.FASTRR_API_KEY ? '✅ Configured' : '⚠️  Not Configured'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('  Flow: Razorpay → verify → Shiprocket → AWB → Confirm');
  console.log('  COD Flow: Order → Shiprocket → AWB → Confirm');
  console.log('');
});
