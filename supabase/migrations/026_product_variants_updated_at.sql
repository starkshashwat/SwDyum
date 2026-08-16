-- 026: trg_apply_inventory_log updates product_variants.updated_at, which
-- the live table never had (the trigger chain never ran before variant_id
-- was set on order items).
BEGIN;
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
COMMIT;
