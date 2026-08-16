-- 021: payments had a pre-existing SELECT policy covering anon that 020's
-- write-policy cleanup left in place. Payments are owner/admin read-only.
BEGIN;
DO $$
DECLARE pol RECORD;
BEGIN
    FOR pol IN SELECT policyname, roles FROM pg_policies
               WHERE schemaname='public' AND tablename='payments' AND cmd IN ('SELECT','ALL') LOOP
        -- keep the owner/admin read policies from 020; drop anything else
        IF pol.policyname NOT IN ('payments_customer_read', 'payments_admin_read') THEN
            EXECUTE format('DROP POLICY %I ON public.payments', pol.policyname);
        END IF;
    END LOOP;
END $$;
COMMIT;
