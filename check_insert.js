import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dligrptvajjsbzlcpjsk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsaWdycHR2YWpqc2J6bGNwanNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDQwMDksImV4cCI6MjA5NzI4MDAwOX0.6840Jbg6FZjOVN_KC6M0wyREEtXlxdKAGxU5U92-CRM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPolicies() {
  const { data, error } = await supabase.from('orders').insert({
    id: "TEST-" + Date.now(),
    customer_id: null,
    subtotal: 1,
    total: 1,
    payment_method: 'Online / Razorpay',
    shipping_details: {}
  });
  
  if (error) {
    console.log("INSERT Error:", error);
  } else {
    console.log("INSERT Success:", data);
  }
}

checkPolicies();
