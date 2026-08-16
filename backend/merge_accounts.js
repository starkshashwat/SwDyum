import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function mergeAccounts() {
  const oldEmailProfileId = '8c3044cf-3281-4229-a117-876879ffba82'; 
  const customPhoneProfileId = 'd5f88224-9ef0-4353-a9f9-0f45537c7415'; 
  const nativeGoogleAuthId = '554b9b09-6ef9-4143-aed5-5ff998d00a85'; 

  console.log("1. Creating/Updating master profile for the native Google Auth ID...");
  const { error: upsertErr } = await supabaseAdmin.from('profiles').upsert({
    id: nativeGoogleAuthId,
    name: 'shashwat kumar',
    email: 'kumarshashwat44@gmail.com',
    phone: '+917549902583',
    role: 'Customer',
    email_verified: true,
    phone_verified: true,
    provider: 'google'
  });
  if (upsertErr) console.error("Upsert Error:", upsertErr);

  console.log("2. Updating auth.users to include the phone number...");
  const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(nativeGoogleAuthId, {
    phone: '+917549902583',
    phone_confirm: true
  });
  if (authErr) console.error("Auth Update Error:", authErr);

  console.log("3. Reassigning orders to the master profile...");
  await supabaseAdmin.from('orders').update({ customer_id: nativeGoogleAuthId }).eq('customer_id', oldEmailProfileId);
  await supabaseAdmin.from('orders').update({ customer_id: nativeGoogleAuthId }).eq('customer_id', customPhoneProfileId);

  console.log("4. Reassigning addresses to the master profile...");
  await supabaseAdmin.from('shipping_addresses').update({ customer_id: nativeGoogleAuthId }).eq('customer_id', oldEmailProfileId);
  await supabaseAdmin.from('shipping_addresses').update({ customer_id: nativeGoogleAuthId }).eq('customer_id', customPhoneProfileId);

  console.log("5. Deleting old duplicate profiles...");
  await supabaseAdmin.from('profiles').delete().eq('id', oldEmailProfileId);
  await supabaseAdmin.from('profiles').delete().eq('id', customPhoneProfileId);

  console.log("Merge complete!");
}

mergeAccounts();
