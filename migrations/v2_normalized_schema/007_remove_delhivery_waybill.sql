-- 007_remove_delhivery_waybill.sql
-- Removes the legacy delhivery_waybill column from the orders table

ALTER TABLE public.orders DROP COLUMN IF EXISTS delhivery_waybill;
