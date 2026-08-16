-- 009_shipping_credentials_username.sql
-- Adds encrypted_username column to shipping_credentials table.
-- The auth flow now uses username + password instead of a single API key.
-- Idempotent: safe to re-run.

BEGIN;

-- Add username column (nullable — legacy rows won't have it)
ALTER TABLE shipping_credentials
    ADD COLUMN IF NOT EXISTS encrypted_username TEXT;

-- Drop the unique constraint on (provider_id, active) that blocks
-- having a deactivated + active row for the same provider.
-- Replace with a partial unique index that only applies to active=true rows.
DO $$
BEGIN
    -- Drop old constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'shipping_credentials_provider_id_active_key'
    ) THEN
        ALTER TABLE shipping_credentials 
            DROP CONSTRAINT shipping_credentials_provider_id_active_key;
    END IF;
END $$;

-- Create partial unique index: only one active credential per provider
CREATE UNIQUE INDEX IF NOT EXISTS idx_shipping_credentials_one_active_per_provider
    ON shipping_credentials (provider_id)
    WHERE active = true;

COMMIT;
