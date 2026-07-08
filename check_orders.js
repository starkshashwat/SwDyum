import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dligrptvajjsbzlcpjsk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsaWdycHR2YWpqc2J6bGNwanNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDQwMDksImV4cCI6MjA5NzI4MDAwOX0.6840Jbg6FZjOVN_KC6M0wyREEtXlxdKAGxU5U92-CRM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkOrders() {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5);
  if (error) {
    console.error("Error fetching orders:", error);
  } else {
    console.log("Recent 5 Orders:");
    console.log(JSON.stringify(data, null, 2));
  }
}

checkOrders();
