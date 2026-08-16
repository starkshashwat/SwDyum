-- 025: live inventory_logs.created_by is UUID, but the 016 triggers and the
-- admin InventoryList write text ('system' / admin email). Cast to TEXT.
BEGIN;
ALTER TABLE public.inventory_logs DROP CONSTRAINT IF EXISTS inventory_logs_created_by_fkey;
ALTER TABLE public.inventory_logs ALTER COLUMN created_by DROP DEFAULT;
ALTER TABLE public.inventory_logs ALTER COLUMN created_by TYPE TEXT USING created_by::text;
ALTER TABLE public.inventory_logs ALTER COLUMN created_by SET DEFAULT 'system';
COMMIT;
