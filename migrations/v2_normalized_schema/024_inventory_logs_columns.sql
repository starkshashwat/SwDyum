-- 024: the live inventory_logs table predates 016's full definition
-- (CREATE TABLE IF NOT EXISTS skipped it), so it lacks reserved_changed —
-- every order_items insert with a variant_id failed with
-- "column reserved_changed of relation inventory_logs does not exist".
BEGIN;
ALTER TABLE public.inventory_logs ADD COLUMN IF NOT EXISTS change_type TEXT;
ALTER TABLE public.inventory_logs ADD COLUMN IF NOT EXISTS quantity_changed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.inventory_logs ADD COLUMN IF NOT EXISTS reserved_changed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.inventory_logs ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE public.inventory_logs ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'system';
ALTER TABLE public.inventory_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
COMMIT;
