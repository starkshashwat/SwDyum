// Read-only probe of anon-level REST access (what an unauthenticated browser can do).
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envText = fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const env = Object.fromEntries(envText.split('\n').filter(l => l.includes('=')).map(l => {
  const i = l.indexOf('=');
  return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
}));

const url = env.VITE_SUPABASE_URL;
const anon = env.VITE_SUPABASE_ANON_KEY;
const s = createClient(url, anon);

for (const t of ['orders', 'payments', 'shipping_credentials', 'product_variants', 'profiles']) {
  const { data, error } = await s.from(t).select('*').limit(2);
  if (error) console.log(`anon ${t}: DENIED (${(error.message || '').slice(0, 90)})`);
  else console.log(`anon ${t}: READABLE (${data.length} rows, cols: ${data.length ? Object.keys(data[0]).slice(0, 8).join(',') : 'n/a'})`);
}

// Unauthenticated automation endpoint probe (backend must be running; expected: connection refused locally)
try {
  const r = await fetch('http://localhost:4000/api/automations/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  console.log('local backend /events (no auth):', r.status);
} catch (e) {
  console.log('local backend not running (expected in this environment)');
}
