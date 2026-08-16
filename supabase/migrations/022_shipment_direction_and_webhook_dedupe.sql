-- 022: allow reverse shipments (same order + provider as the forward one)
-- and deduplicate redelivered Velocity webhooks.
BEGIN;

-- Forward/reverse direction. The old UNIQUE(order_id, provider_id) made
-- every return shipment violate the constraint after Velocity had already
-- accepted it.
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS direction TEXT NOT NULL DEFAULT 'forward';
ALTER TABLE public.shipments DROP CONSTRAINT IF EXISTS shipments_order_id_provider_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS shipments_order_provider_direction_uniq
    ON public.shipments (order_id, provider_id, direction);

-- Stable id for a webhook delivery (provider + shipment + status + AWB +
-- pickup/manifest timestamps when present). Redelivered events map to the
-- same uid and are skipped via ON CONFLICT DO NOTHING.
ALTER TABLE public.webhook_events ADD COLUMN IF NOT EXISTS event_uid TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS webhook_events_uid_uniq
    ON public.webhook_events (event_uid) WHERE event_uid IS NOT NULL;

COMMIT;
