-- ════════════════════════════════════════════════════════════════════════════
-- SECURE whatsapp_otps TABLE (V3 / V9)
-- - OTPs are stored as SHA-256 hashes (never plaintext).
-- - An attempt counter enables brute-force lockout.
-- - RLS is restricted to the service role ONLY (anon/authenticated cannot read
--   or write OTPs). The previous policy used USING(true) WITH CHECK(true)
--   with no TO clause, exposing every active OTP to the public anon key.
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.whatsapp_otps (
    phone TEXT PRIMARY KEY,
    otp_hash TEXT NOT NULL,                       -- SHA-256 hex of the OTP
    attempts INTEGER NOT NULL DEFAULT 0,          -- failed verification attempts
    locked_until TIMESTAMP WITH TIME ZONE,        -- lockout timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Add whatsapp_opt_in column to profiles to track promotional permissions.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT true;

-- Enable Row Level Security.
ALTER TABLE public.whatsapp_otps ENABLE ROW LEVEL SECURITY;

-- Drop the previous open policy and any prior version of the secure policy.
DROP POLICY IF EXISTS "Enable service role access for whatsapp_otps" ON public.whatsapp_otps;
DROP POLICY IF EXISTS "Service role only access for whatsapp_otps" ON public.whatsapp_otps;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.whatsapp_otps;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.whatsapp_otps;
DROP POLICY IF EXISTS "Enable read all for authenticated users" ON public.whatsapp_otps;

-- Only the service role (used by edge functions) may access this table.
-- anon and authenticated are denied.
CREATE POLICY "Service role only access for whatsapp_otps"
ON public.whatsapp_otps
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Index for fast lookups by phone.
CREATE INDEX IF NOT EXISTS whatsapp_otps_phone_idx ON public.whatsapp_otps (phone);
