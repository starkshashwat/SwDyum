import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMessages() {
  const { data, error } = await supabase
    .from('whatsapp_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching messages:', error);
  } else {
    console.log(`Found ${data.length} messages in database:`);
    data.forEach(m => {
      console.log(`- [${m.direction}] phone: "${m.phone}", name: "${m.name}", message: "${m.message}", created_at: ${m.created_at}`);
    });
  }
}

checkMessages();
