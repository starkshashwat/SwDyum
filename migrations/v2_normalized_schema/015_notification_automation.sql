-- 015_notification_automation.sql
BEGIN;

-- 1. Alter notification_settings table to add new columns
ALTER TABLE public.notification_settings ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.notification_settings ADD COLUMN IF NOT EXISTS audience TEXT DEFAULT 'Customer';
ALTER TABLE public.notification_settings ADD COLUMN IF NOT EXISTS conditions JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.notification_settings ADD COLUMN IF NOT EXISTS last_triggered_at TIMESTAMPTZ;
ALTER TABLE public.notification_settings ADD COLUMN IF NOT EXISTS success_rate NUMERIC(5,2);
ALTER TABLE public.notification_settings ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT true;

-- Update existing default events with category
UPDATE public.notification_settings SET category = 'Order' WHERE event_type IN ('order_placed', 'order_shipped', 'order_delivered');

-- 2. Create notification_logs table
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_id UUID REFERENCES public.notification_settings(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_id TEXT,
    phone TEXT,
    template_name TEXT,
    status TEXT NOT NULL CHECK (status IN ('Sent', 'Failed', 'Pending', 'Skipped')),
    error_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view notification_logs" ON public.notification_logs;
CREATE POLICY "Admins can view notification_logs"
ON public.notification_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role::text IN ('Admin', 'Super Admin', 'Manager')
  )
);

-- Note: We might want the backend service role to insert logs, which bypassing RLS.

-- 3. Seed required events
INSERT INTO public.notification_settings (event_type, category, audience, is_enabled, is_system) VALUES
    ('payment_successful', 'Payment', 'Customer', false, true),
    ('payment_failed', 'Payment', 'Customer', false, true),
    ('order_confirmed', 'Order', 'Customer', false, true),
    ('order_packed', 'Shipping', 'Customer', false, true),
    ('out_for_delivery', 'Shipping', 'Customer', false, true),
    ('order_cancelled', 'Order', 'Customer', false, true),
    ('damaged_wrong_order_support', 'Customer', 'Both', false, true),
    ('review_request', 'Review', 'Customer', false, true),
    ('new_customer_signup', 'Customer', 'Admin', false, true),
    ('low_stock_alert', 'Inventory', 'Admin', false, true),
    ('new_bulk_order_inquiry', 'Order', 'Admin', false, true)
ON CONFLICT (event_type) DO UPDATE SET 
    category = EXCLUDED.category,
    audience = EXCLUDED.audience;

COMMIT;
