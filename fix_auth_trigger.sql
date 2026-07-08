-- 1. Drop the broken trigger that is crashing user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop the foreign key constraint so we can create WhatsApp users directly in the profiles table without needing them to exist in Supabase Auth
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 3. Make email optional since WhatsApp users won't have an email initially
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
