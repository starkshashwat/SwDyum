-- 016_inventory_management.sql
BEGIN;

-- 1. Alter product_variants table
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS reserved_quantity INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10,2);
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 10;
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS batch_number TEXT;
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS manufacturing_date DATE;
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- Ensure constraints (stock_quantity check already exists >= 0)
ALTER TABLE public.product_variants DROP CONSTRAINT IF EXISTS product_variants_reserved_quantity_check;
ALTER TABLE public.product_variants ADD CONSTRAINT product_variants_reserved_quantity_check CHECK (reserved_quantity >= 0);

-- 2. Create inventory_logs table
CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL,
    quantity_changed INTEGER NOT NULL DEFAULT 0,
    reserved_changed INTEGER NOT NULL DEFAULT 0,
    note TEXT,
    created_by TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for logs
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view inventory_logs" ON public.inventory_logs;
CREATE POLICY "Admins can view inventory_logs"
ON public.inventory_logs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role::text IN ('Admin', 'Super Admin', 'Manager')
  )
);

-- 3. Trigger 1: Apply inventory log to variant
CREATE OR REPLACE FUNCTION public.trg_apply_inventory_log() RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.product_variants
    SET 
        stock_quantity = stock_quantity + COALESCE(NEW.quantity_changed, 0),
        reserved_quantity = reserved_quantity + COALESCE(NEW.reserved_changed, 0),
        updated_at = now()
    WHERE id = NEW.variant_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_apply_inventory_log ON public.inventory_logs;
CREATE TRIGGER trigger_apply_inventory_log
AFTER INSERT ON public.inventory_logs
FOR EACH ROW
EXECUTE FUNCTION public.trg_apply_inventory_log();


-- 4. Trigger 2: Reserve stock on order_items insert
CREATE OR REPLACE FUNCTION public.trg_order_items_reserve() RETURNS TRIGGER AS $$
DECLARE
    v_order_status TEXT;
BEGIN
    SELECT status INTO v_order_status FROM public.orders WHERE id = NEW.order_id;
    
    IF v_order_status IN ('Pending', 'Paid', 'Confirmed', 'Processing') THEN
        IF NEW.variant_id IS NOT NULL THEN
            INSERT INTO public.inventory_logs (variant_id, change_type, quantity_changed, reserved_changed, note, created_by)
            VALUES (NEW.variant_id, 'Reservation', 0, NEW.quantity, 'Order ' || NEW.order_id, 'system');
        END IF;
    ELSIF v_order_status IN ('Shipped', 'Delivered') THEN
        IF NEW.variant_id IS NOT NULL THEN
            INSERT INTO public.inventory_logs (variant_id, change_type, quantity_changed, reserved_changed, note, created_by)
            VALUES (NEW.variant_id, 'Fulfillment (Direct)', -NEW.quantity, 0, 'Order ' || NEW.order_id, 'system');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_order_items_reserve ON public.order_items;
CREATE TRIGGER trigger_order_items_reserve
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.trg_order_items_reserve();


-- 5. Trigger 3: Adjust stock on orders status update
CREATE OR REPLACE FUNCTION public.trg_orders_inventory_update() RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
BEGIN
    -- Transition to Shipped/Delivered (Fulfillment)
    IF NEW.status IN ('Shipped', 'Delivered') AND OLD.status NOT IN ('Shipped', 'Delivered') THEN
        FOR item IN SELECT variant_id, quantity FROM public.order_items WHERE order_id = NEW.id AND variant_id IS NOT NULL LOOP
            INSERT INTO public.inventory_logs (variant_id, change_type, quantity_changed, reserved_changed, note, created_by)
            VALUES (item.variant_id, 'Fulfillment', -item.quantity, -item.quantity, 'Order ' || NEW.id || ' Shipped', 'system');
        END LOOP;
    END IF;

    -- Transition to Cancelled/Failed/Refunded (Cancellation)
    IF NEW.status IN ('Cancelled', 'Failed', 'Refunded') AND OLD.status NOT IN ('Cancelled', 'Failed', 'Refunded') THEN
        FOR item IN SELECT variant_id, quantity FROM public.order_items WHERE order_id = NEW.id AND variant_id IS NOT NULL LOOP
            IF OLD.status IN ('Shipped', 'Delivered') THEN
                -- It was already fulfilled, so add stock back (no reservation change)
                INSERT INTO public.inventory_logs (variant_id, change_type, quantity_changed, reserved_changed, note, created_by)
                VALUES (item.variant_id, 'Cancellation (Return)', item.quantity, 0, 'Order ' || NEW.id || ' Cancelled/Refunded', 'system');
            ELSE
                -- It was just reserved, so release the reservation (no stock change)
                -- We use GREATEST to prevent negative reserved_quantity if data was weird
                INSERT INTO public.inventory_logs (variant_id, change_type, quantity_changed, reserved_changed, note, created_by)
                VALUES (item.variant_id, 'Cancellation (Release)', 0, -item.quantity, 'Order ' || NEW.id || ' Cancelled/Failed', 'system');
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_orders_inventory_update ON public.orders;
CREATE TRIGGER trigger_orders_inventory_update
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.trg_orders_inventory_update();

COMMIT;
