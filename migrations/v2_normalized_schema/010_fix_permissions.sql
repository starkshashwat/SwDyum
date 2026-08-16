-- 010_fix_permissions.sql
BEGIN;

-- 1. Grant basic access to API roles
GRANT ALL ON TABLE public.notification_settings TO anon, authenticated, service_role;

-- 2. Enable RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- 3. Create Admin Policy
DROP POLICY IF EXISTS "Admins can manage notification_settings" ON public.notification_settings;
CREATE POLICY "Admins can manage notification_settings" ON public.notification_settings
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 4. Enable Realtime for Inbox syncing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'whatsapp_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;
    END IF;
END $$;

COMMIT;
