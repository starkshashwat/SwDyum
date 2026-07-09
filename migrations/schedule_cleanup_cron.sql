-- ════════════════════════════════════════════════════════════════════════════
-- Migration: Schedule the cleanup-pending-checkouts edge function via pg_cron
-- Purpose: Every 5 minutes, invoke the edge function that marks abandoned
--          Razorpay checkouts (pending > 30 min) as 'failed'.
--
-- Prerequisites:
--   1. The `pg_cron` and `pg_net` extensions must be enabled in Supabase
--      (Dashboard > Database > Extensions). They are enabled by default on
--      most Supabase projects.
--   2. Replace <PROJECT_REF> with your Supabase project reference and
--      <SERVICE_ROLE_KEY> with your service-role key (or set CRON_SECRET on
--      the edge function and use that here instead).
--   3. Deploy the edge function:
--        supabase functions deploy cleanup-pending-checkouts
-- ═════════════════════════════════════════════════════════════════════════════

-- Ensure the required extensions exist (idempotent).
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Drop any previous schedule so re-running this script is safe.
-- SELECT cron.unschedule('cleanup-pending-checkouts');

-- Schedule the invocation every 5 minutes.
-- NOTE: edit the URL + Authorization header before running.
SELECT cron.schedule(
  'cleanup-pending-checkouts',
  '*/5 * * * *',
  $$
    SELECT net.http_post(
      url := 'https://dligrptvajjsbzlcpjsk.functions.supabase.co/cleanup-pending-checkouts',
      headers := jsonb_build_object(
        'Authorization', 'Bearer <SERVICE_ROLE_KEY>',
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  $$
);

-- ── Optional: enable Realtime on the orders table if not already enabled ─────
-- The admin UI relies on Supabase Realtime to refresh without a manual reload.
-- Run this only if Realtime is not yet publishing changes for `orders`.
-- (Supabase Dashboard > Database > Replication > toggle `orders` on, OR:)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
