-- ════════════════════════════════════════════════════════════════════════════
-- ADMIN USER PROVISIONING (V8)
-- Run this MANUALLY via the Supabase SQL editor (service role) to grant admin
-- access to a verified operator. Do NOT seed admin emails in version-controlled
-- SQL files — anyone could sign up with those emails and gain admin privileges.
--
-- Prerequisite: the user must already exist in auth.users (signed up + verified).
-- ════════════════════════════════════════════════════════════════════════════

-- Replace the email below with the real operator's verified email, then run:
INSERT INTO public.admin_users (email, role)
VALUES ('swadyum@gmail.com', 'super_admin')
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role;

-- To revoke admin access:
-- DELETE FROM public.admin_users WHERE email = 'operator@swadyum.store';

-- Roles in use: super_admin | manager | warehouse
