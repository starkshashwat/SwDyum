// Read-only live-schema probe: sample one row per table (service role) and print column names.
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const tables = ['orders', 'order_items', 'payments', 'product_variants', 'products', 'coupons', 'profiles', 'invoices', 'order_timeline'];

for (const t of tables) {
  const { data, error } = await supabase.from(t).select('*').limit(1);
  if (error) { console.log(`\n== ${t}: ERROR: ${error.message}`); continue; }
  if (!data || !data.length) { console.log(`\n== ${t}: exists, EMPTY (0 rows) ==`); continue; }
  console.log(`\n== ${t} (${data.length} row sampled) ==`);
  console.log('  ' + Object.keys(data[0]).join(', '));
}

// is_admin function exists? try a harmless select via it (will error if missing)
const { error: rpcErr } = await supabase.rpc('is_admin');
console.log(`\nis_admin rpc: ${rpcErr ? rpcErr.message : 'callable'}`);

// count orders/payments rows to know if production data exists
for (const t of ['orders', 'payments', 'profiles', 'product_variants']) {
  const { count, error } = await supabase.from(t).select('id', { count: 'exact', head: true });
  console.log(`count ${t}: ${error ? error.message : count}`);
}
