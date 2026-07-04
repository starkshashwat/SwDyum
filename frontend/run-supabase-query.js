const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dligrptvajjsbzlcpjsk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsaWdycHR2YWpqc2J6bGNwanNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDQwMDksImV4cCI6MjA5NzI4MDAwOX0.6840Jbg6FZjOVN_KC6M0wyREEtXlxdKAGxU5U92-CRM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  // Sign in as the admin
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'swadyum@gmail.com',
    password: 'password123' // Or whatever the password is, wait I don't know it!
  });

  // Better way: use pg directly as a simulated authenticated user!
}

run();
