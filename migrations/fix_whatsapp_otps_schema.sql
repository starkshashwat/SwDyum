-- ════════════════════════════════════════════════════════════════════════════
-- FIX: align live whatsapp_otps table with the security-hardened edge function
-- ════════════════════════════════════════════════════════════════════════════
-- The whatsapp-auth edge function (secure V3 version) writes otp_hash / attempts
-- / locked_until, but the live table pre-dated that change and only had the old
-- plaintext `otp` column. Because the table already existed, the
-- CREATE TABLE IF NOT EXISTS in create_whatsapp_auth_tables.sql never added the
-- new columns, so every "send OTP" insert failed with a 500
-- ("An unexpected error occurred.").
--
-- This migration is additive and non-destructive: it adds the missing columns
-- and relaxes the now-unused NOT NULL `otp` column so inserts succeed.
-- Safe to run multiple times (idempotent).

ALTER TABLE public.whatsapp_otps ADD COLUMN IF NOT EXISTS otp_hash TEXT;
ALTER TABLE public.whatsapp_otps ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.whatsapp_otps ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- The hardened function no longer stores plaintext OTPs, so `otp` must be nullable.
ALTER TABLE public.whatsapp_otps ALTER COLUMN otp DROP NOT NULL;

-- Ensure the promotional opt-in column exists on profiles (used during verify).
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT true;
