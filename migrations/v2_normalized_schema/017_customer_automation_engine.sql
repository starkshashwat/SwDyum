BEGIN;

-- 1. Automations Table
CREATE TABLE IF NOT EXISTS public.automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    trigger_event TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Paused', 'Archived')),
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Automation Steps Table
-- Steps are tied to an automation and version. 
-- When an automation is updated, a new version is created, and steps are cloned to the new version.
CREATE TABLE IF NOT EXISTS public.automation_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES public.automations(id) ON DELETE CASCADE,
    automation_version INTEGER NOT NULL,
    step_order INTEGER NOT NULL,
    step_type TEXT NOT NULL CHECK (step_type IN ('Send Email', 'Send WhatsApp', 'Wait', 'Condition', 'Add Customer Tag', 'Generate Coupon', 'Send Coupon', 'End Automation')),
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_automation_steps_automation_version ON public.automation_steps(automation_id, automation_version, step_order);

-- 3. Automation Events Table (for Idempotency)
CREATE TABLE IF NOT EXISTS public.automation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT UNIQUE NOT NULL,
    event_name TEXT NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Automation Runs Table
CREATE TABLE IF NOT EXISTS public.automation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES public.automations(id) ON DELETE CASCADE,
    automation_version INTEGER NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    trigger_event_id TEXT REFERENCES public.automation_events(event_id) ON DELETE SET NULL,
    current_step_order INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'waiting', 'completed', 'failed', 'cancelled', 'stopped_by_condition')),
    next_execution_at TIMESTAMPTZ,
    error_message TEXT,
    context_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_automation_runs_waiting ON public.automation_runs(status, next_execution_at) WHERE status = 'waiting';
CREATE INDEX IF NOT EXISTS idx_automation_runs_customer ON public.automation_runs(customer_id);

-- 5. Email Templates Table
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    preheader TEXT,
    body_html TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Draft', 'Archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. WhatsApp Templates Table
-- Note: WhatsApp templates usually require provider approval, so this tracks the approved templates.
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    template_id TEXT, -- Meta template ID
    language TEXT NOT NULL DEFAULT 'en_US',
    category TEXT,
    body_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Draft', 'Pending', 'Rejected', 'Archived')),
    provider TEXT NOT NULL DEFAULT 'Meta',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Communication Logs Table
CREATE TABLE IF NOT EXISTS public.communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    channel TEXT NOT NULL CHECK (channel IN ('Email', 'WhatsApp')),
    automation_run_id UUID REFERENCES public.automation_runs(id) ON DELETE SET NULL,
    template_name TEXT,
    status TEXT NOT NULL CHECK (status IN ('Queued', 'Sent', 'Delivered', 'Failed', 'Bounced', 'Read', 'Clicked')),
    provider_message_id TEXT,
    error_message TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_communication_logs_customer ON public.communication_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_automation_run ON public.communication_logs(automation_run_id);

-- 8. Customer Communication Preferences Table
CREATE TABLE IF NOT EXISTS public.communication_preferences (
    customer_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    email_marketing BOOLEAN NOT NULL DEFAULT true,
    email_transactional BOOLEAN NOT NULL DEFAULT true,
    whatsapp_marketing BOOLEAN NOT NULL DEFAULT true,
    whatsapp_transactional BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_automation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_automations_updated_at
BEFORE UPDATE ON public.automations
FOR EACH ROW EXECUTE FUNCTION update_automation_updated_at();

CREATE TRIGGER trigger_update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW EXECUTE FUNCTION update_automation_updated_at();

CREATE TRIGGER trigger_update_whatsapp_templates_updated_at
BEFORE UPDATE ON public.whatsapp_templates
FOR EACH ROW EXECUTE FUNCTION update_automation_updated_at();

CREATE TRIGGER trigger_update_communication_preferences_updated_at
BEFORE UPDATE ON public.communication_preferences
FOR EACH ROW EXECUTE FUNCTION update_automation_updated_at();

-- RLS Policies
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_preferences ENABLE ROW LEVEL SECURITY;

-- Admins can do anything
CREATE POLICY "Admins full access to automations" ON public.automations FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'Admin', 'super_admin', 'Super Admin', 'manager', 'Manager', 'editor', 'Editor')));
CREATE POLICY "Admins full access to automation_steps" ON public.automation_steps FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'Admin', 'super_admin', 'Super Admin', 'manager', 'Manager', 'editor', 'Editor')));
CREATE POLICY "Admins full access to automation_events" ON public.automation_events FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'Admin', 'super_admin', 'Super Admin', 'manager', 'Manager', 'editor', 'Editor')));
CREATE POLICY "Admins full access to automation_runs" ON public.automation_runs FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'Admin', 'super_admin', 'Super Admin', 'manager', 'Manager', 'editor', 'Editor')));
CREATE POLICY "Admins full access to email_templates" ON public.email_templates FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'Admin', 'super_admin', 'Super Admin', 'manager', 'Manager', 'editor', 'Editor')));
CREATE POLICY "Admins full access to whatsapp_templates" ON public.whatsapp_templates FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'Admin', 'super_admin', 'Super Admin', 'manager', 'Manager', 'editor', 'Editor')));
CREATE POLICY "Admins full access to communication_logs" ON public.communication_logs FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'Admin', 'super_admin', 'Super Admin', 'manager', 'Manager', 'editor', 'Editor')));
CREATE POLICY "Admins full access to communication_preferences" ON public.communication_preferences FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'Admin', 'super_admin', 'Super Admin', 'manager', 'Manager', 'editor', 'Editor')));

-- Customers can view/update their own preferences
CREATE POLICY "Customers can view their preferences" ON public.communication_preferences FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can update their preferences" ON public.communication_preferences FOR UPDATE USING (auth.uid() = customer_id);

-- Customers can view their own communication logs (optional, but good practice)
CREATE POLICY "Customers can view their communication logs" ON public.communication_logs FOR SELECT USING (auth.uid() = customer_id);

COMMIT;
