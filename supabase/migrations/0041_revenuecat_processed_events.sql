-- Idempotency table for RevenueCat webhook events
-- Prevents double-processing if RevenueCat retries a failed delivery
CREATE TABLE IF NOT EXISTS revenuecat_processed_events (
  event_id    TEXT        PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE revenuecat_processed_events ENABLE ROW LEVEL SECURITY;

-- Only service_role may access this table (RLS blocks all other roles)
CREATE POLICY "revenuecat_events: service_role only"
  ON revenuecat_processed_events
  USING (false);
