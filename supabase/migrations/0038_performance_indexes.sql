-- Indekser for vanlige filtrerings- og sorteringsspørringer.
-- Manglende indekser på dato-kolonner gir seq-scan ved sortering.

CREATE INDEX IF NOT EXISTS idx_inspections_hive_inspected_desc
  ON inspections (hive_id, inspected_at DESC);

CREATE INDEX IF NOT EXISTS idx_treatments_hive_treated_desc
  ON treatments (hive_id, treated_at DESC);

CREATE INDEX IF NOT EXISTS idx_hive_weights_hive_weighed_desc
  ON hive_weights (hive_id, weighed_at DESC);

CREATE INDEX IF NOT EXISTS idx_harvests_hive_harvested_desc
  ON harvest_records (hive_id, harvested_at DESC);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date
  ON calendar_events (user_id, event_date);
