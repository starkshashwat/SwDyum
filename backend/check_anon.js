import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function main() {
  const { data, error } = await supabaseAnon.from('notification_settings').select('*');
  console.log('Anon Settings:', data);
  console.log('Anon Error:', error);
}

main();
