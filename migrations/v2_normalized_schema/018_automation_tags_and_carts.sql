BEGIN;

-- ============================================================
-- AUTOMATION EVENTS EXTENSION (for Edge Function ingestion)
-- ============================================================
ALTER TABLE public.automation_events ADD COLUMN IF NOT EXISTS processed BOOLEAN NOT NULL DEFAULT false;
-- Set existing events to processed = true so they don't get double-processed
UPDATE public.automation_events SET processed = true WHERE processed = false;

CREATE INDEX IF NOT EXISTS idx_automation_events_unprocessed ON public.automation_events(processed) WHERE processed = false;

-- ============================================================
-- CUSTOMER TAGS
-- ============================================================
-- Reusable tags that can be assigned to customers via automation
-- or manually by admins. Examples: 'abandoned-cart', 'vip', 'repeat-buyer'
CREATE TABLE IF NOT EXISTS public.customer_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6B7280', -- hex color for UI badge
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.customer_tags IS 'Reusable tags for customer segmentation. Created by admins or automation actions.';

-- ============================================================
-- CUSTOMER TAG ASSIGNMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customer_tag_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.customer_tags(id) ON DELETE CASCADE,
    source TEXT DEFAULT 'manual', -- 'manual' | 'automation'
    automation_run_id UUID REFERENCES public.automation_runs(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(customer_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_customer ON public.customer_tag_assignments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_tag ON public.customer_tag_assignments(tag_id);

COMMENT ON TABLE public.customer_tag_assignments IS 'Many-to-many join: customer <-> tag. Unique constraint prevents duplicate tag assignment.';

-- ============================================================
-- ABANDONED CARTS (minimal server-side tracking)
-- ============================================================
-- The Swadyum frontend stores cart in localStorage. This table provides
-- minimal server-side cart snapshots for abandoned cart detection.
-- The frontend syncs cart state here when a logged-in user has items.
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_email TEXT,
    customer_phone TEXT,
    cart_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    cart_value NUMERIC(10,2) NOT NULL DEFAULT 0,
    cart_url TEXT DEFAULT 'https://swadyum.store',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'abandoned', 'recovered', 'expired')),
    abandoned_at TIMESTAMPTZ, -- set when status changes to 'abandoned'
    automation_triggered BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(customer_id) -- one active cart per customer
);

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_status ON public.abandoned_carts(status, updated_at);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_customer ON public.abandoned_carts(customer_id);

COMMENT ON TABLE public.abandoned_carts IS 'Server-side cart snapshots synced from frontend localStorage. Used by cart abandonment detection worker.';
COMMENT ON COLUMN public.abandoned_carts.status IS 'active = cart has items and is being updated; abandoned = detected by worker; recovered = order placed; expired = stale/cleaned up.';

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE public.customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admins full access to customer_tags" ON public.customer_tags
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role::text IN ('admin', 'Admin', 'super_admin', 'Super Admin', 'manager', 'Manager', 'editor', 'Editor')
    ));

CREATE POLICY "Admins full access to customer_tag_assignments" ON public.customer_tag_assignments
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role::text IN ('admin', 'Admin', 'super_admin', 'Super Admin', 'manager', 'Manager', 'editor', 'Editor')
    ));

CREATE POLICY "Admins full access to abandoned_carts" ON public.abandoned_carts
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role::text IN ('admin', 'Admin', 'super_admin', 'Super Admin', 'manager', 'Manager', 'editor', 'Editor')
    ));

-- Customers can upsert their own cart (for frontend sync)
CREATE POLICY "Customers can manage their own cart" ON public.abandoned_carts
    FOR ALL USING (auth.uid() = customer_id)
    WITH CHECK (auth.uid() = customer_id);

-- Service role bypass (for workers and edge functions)
-- Note: supabaseAdmin (service_role key) bypasses RLS automatically.

COMMIT;
