// server.js — Swadyum Shiprocket Proxy Server
// Runs on port 3001 alongside Vite (port 5173)
// Handles Shiprocket API calls server-side to avoid CORS restrictions

import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually (dotenv ESM compatible)
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

// CORS — only allow requests from Vite dev server
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  methods: ['GET', 'POST', 'OPTIONS'],
}));
app.use(express.json());

// ─── Token Cache (valid 239 hours) ──────────────────────────────────────────
let cachedToken = null;
let tokenExpiry = 0;

async function getShiprocketToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password || email.includes('your_api_user_email')) {
    throw new Error(
      'Shiprocket credentials not set. Please update .env with SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD.'
    );
  }

  console.log(`🔐 Authenticating with Shiprocket (${email})...`);

  const res = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!data.token) {
    throw new Error(`Shiprocket auth failed: ${JSON.stringify(data)}`);
  }

  cachedToken = data.token;
  tokenExpiry = Date.now() + 239 * 60 * 60 * 1000; // 239 hours
  console.log('✅ Shiprocket token acquired (valid 239h)');
  return cachedToken;
}

// Helper to make authenticated Shiprocket requests
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

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '🥒 Swadyum Shiprocket Proxy is running',
    pickup_location: PICKUP_LOCATION,
    credentials_set: !!(
      process.env.SHIPROCKET_EMAIL &&
      !process.env.SHIPROCKET_EMAIL.includes('your_api_user_email')
    ),
  });
});

// ─── Create Order ────────────────────────────────────────────────────────────
app.post('/api/shiprocket/create-order', async (req, res) => {
  try {
    console.log('📦 Creating Shiprocket order:', req.body.order_id);

    // Inject correct pickup location from server env
    const payload = { ...req.body, pickup_location: PICKUP_LOCATION };

    const data = await shiprocketRequest('/orders/create/adhoc', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (data.shipment_id) {
      console.log(
        `✅ Order created — Shiprocket ID: ${data.order_id}, Shipment: ${data.shipment_id}`
      );
    } else {
      console.warn('⚠️ Shiprocket order response:', data);
    }

    res.json(data);
  } catch (err) {
    console.error('❌ create-order error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Assign AWB ──────────────────────────────────────────────────────────────
app.post('/api/shiprocket/assign-awb', async (req, res) => {
  try {
    console.log('📬 Assigning AWB for shipment:', req.body.shipment_id);

    const data = await shiprocketRequest('/courier/assign/awb', {
      method: 'POST',
      body: JSON.stringify(req.body),
    });

    const awb = data?.response?.data?.awb_code || data?.awb_code;
    const courier = data?.response?.data?.courier_name || data?.courier_name;

    if (awb) {
      console.log(`✅ AWB assigned: ${awb} via ${courier}`);
    } else {
      console.warn('⚠️ AWB assign response:', JSON.stringify(data, null, 2));
    }

    res.json(data);
  } catch (err) {
    console.error('❌ assign-awb error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Generate Label ───────────────────────────────────────────────────────────
app.post('/api/shiprocket/generate-label', async (req, res) => {
  try {
    console.log('🏷️  Generating label for shipment:', req.body.shipment_id);

    const data = await shiprocketRequest('/courier/generate/label', {
      method: 'POST',
      body: JSON.stringify(req.body),
    });

    if (data.label_url) {
      console.log('✅ Label URL generated');
    } else {
      console.warn('⚠️ Label response:', data);
    }

    res.json(data);
  } catch (err) {
    console.error('❌ generate-label error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Track Shipment ───────────────────────────────────────────────────────────
app.get('/api/shiprocket/track/:awb', async (req, res) => {
  try {
    console.log('🔍 Tracking AWB:', req.params.awb);

    const data = await shiprocketRequest(
      `/courier/track/awb/${req.params.awb}`,
      { method: 'GET' }
    );

    res.json(data);
  } catch (err) {
    console.error('❌ track error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🥒  Swadyum × Shiprocket Proxy  |  port ${PORT}`);
  console.log(`📍  Pickup Location : ${PICKUP_LOCATION}`);
  console.log(
    `🔑  Credentials     : ${
      process.env.SHIPROCKET_EMAIL &&
      !process.env.SHIPROCKET_EMAIL.includes('your_api_user_email')
        ? `✅ ${process.env.SHIPROCKET_EMAIL}`
        : '⚠️  Not configured — update .env'
    }`
  );
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
});
