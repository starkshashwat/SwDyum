// Verifies the deployed (cloud) edge functions reject unauthenticated/tampered calls.
import fs from 'fs';
import { createRequire } from 'module';

const envText = fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const env = Object.fromEntries(envText.split('\n').filter(l => l.includes('=')).map(l => {
  const i = l.indexOf('=');
  return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
}));

const base = env.VITE_SUPABASE_URL.replace(/\/$/, '') + '/functions/v1/';
const anon = env.VITE_SUPABASE_ANON_KEY;
const headers = { apikey: anon, Authorization: 'Bearer ' + anon, 'Content-Type': 'application/json' };

const post = async (fn, body) => {
  const r = await fetch(base + fn, { method: 'POST', headers, body: JSON.stringify(body) });
  return { status: r.status, text: (await r.text()).slice(0, 160) };
};

// 1. Old client contract (client-controlled amount, no items) must be rejected
console.log('razorpay amount-only (tamper):', await post('razorpay', { action: 'create_order', amount: 1, receipt: 'rcpt_probe' }));
// 2. Valid-shape items against a real product but absurd quantity → stock/price enforced server-side
console.log('razorpay qty=9999 (oversell):', await post('razorpay', { action: 'create_order', items: [{ slug: 'mango-pickle', weight: '250g', quantity: 9999 }], receipt: 'rcpt_probe2' }));
// 3. Unauthenticated WhatsApp send must be 401
console.log('send-whatsapp-message (anon):', await post('send-whatsapp-message', { phone: '919999999999', message: 'probe' }));
// 4. Forged Meta webhook without signature must be rejected
console.log('whatsapp-webhook (no sig):', await post('whatsapp-webhook', { object: 'whatsapp_business_account', entry: [{ changes: [{ value: { messages: [{ id: 'forged', from: '919999999999', type: 'text', text: { body: 'x' } }] } }] }] }));
