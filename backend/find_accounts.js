import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findAccounts() {
  console.log("Searching auth.users for phone or email...");
  
  // Need to use the admin API to list users
  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error(error);
    return;
  }
  
  const relevantUsers = users.users.filter(u => 
    (u.email && u.email.includes('shashwat')) || 
    (u.phone && u.phone.includes('7549902583')) ||
    (u.user_metadata?.email?.includes('shashwat'))
  );
  
  console.log("Found Users in auth.users:", JSON.stringify(relevantUsers, null, 2));

  console.log("\nSearching public.profiles...");
  const { data: profiles } = await supabaseAdmin.from('profiles').select('*')
    .or('phone.eq.+917549902583,email.ilike.%shashwat%');
  
  console.log("Found Profiles in public.profiles:", JSON.stringify(profiles, null, 2));
}

findAccounts();
