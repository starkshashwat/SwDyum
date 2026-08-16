import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectTable() {
  const { data, error } = await supabase
    .from('whatsapp_messages')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
  } else if (data && data.length > 0) {
    console.log('Actual keys in whatsapp_messages table row:', Object.keys(data[0]));
    console.log('Sample row:', data[0]);
  } else {
    console.log('No rows returned.');
  }
}

inspectTable();
