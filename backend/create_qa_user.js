import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createQaAdmin() {
  const email = 'qa@swadyum.com';
  const password = 'Password123!';

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error && error.message !== 'User already registered') {
    console.error('Error creating user:', error);
    return;
  }

  const userId = data?.user?.id || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === email).id;

  await supabase.from('profiles').upsert({
    id: userId,
    email: email,
    role: 'Super Admin',
    name: 'QA Agent',
  });

  console.log('Created qa@swadyum.com : Password123!');
}

createQaAdmin();
