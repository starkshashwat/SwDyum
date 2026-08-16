import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or('phone.eq.+917549902583,email.eq.kumarshashwat7739@gmail.com,email.eq.shashwat.kumar@example.com');
  
  console.log(JSON.stringify(data, null, 2));
  console.log("Error:", error);
}

main();
