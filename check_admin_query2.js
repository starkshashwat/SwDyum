import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dligrptvajjsbzlcpjsk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsaWdycHR2YWpqc2J6bGNwanNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDQwMDksImV4cCI6MjA5NzI4MDAwOX0.6840Jbg6FZjOVN_KC6M0wyREEtXlxdKAGxU5U92-CRM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAdminQuery() {
  const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles(name, email, phone)
        `)
        .order('created_at', { ascending: false });
  if (error) {
    console.log("Admin Query Error:", error);
  } else {
    console.log("Admin Query Success:", data.length, "orders fetched.");
  }
}

checkAdminQuery();
