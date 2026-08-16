// Replays the storefront's create_order call against the deployed function
// to capture the real error body (what the checkout page receives).
import fs from 'fs';

const envText = fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const env = Object.fromEntries(envText.split('\n').filter(l => l.includes('=')).map(l => {
  const i = l.indexOf('=');
  return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
}));

const fnUrl = env.VITE_SUPABASE_URL.replace(/\/$/, '') + '/functions/v1/razorpay';
const anon = env.VITE_SUPABASE_ANON_KEY;

// Exactly what the new CheckoutPage / PurchaseDrawer sends
const body = {
  action: 'create_order',
  items: [{ slug: 'mango-pickle', weight: '500g', quantity: 1 }],
  coupon_code: null,
  customer: {
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '9999999999',
    address: 'Test Street',
    city: 'arrah',
    state: 'bihar',
    zip: '802301',
  },
  receipt: `rcpt_probe_${Date.now()}`,
};

const r = await fetch(fnUrl, {
  method: 'POST',
  headers: { apikey: anon, Authorization: `Bearer ${anon}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
const text = await r.text();
console.log('HTTP', r.status);
console.log(text.slice(0, 800));
