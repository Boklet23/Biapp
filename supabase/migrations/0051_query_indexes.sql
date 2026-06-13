-- Indekshull avdekket i review v3 (Agent 6 K9 + Agent 12):

-- 1) get_latest_inspections_per_hive() (0012) gjør
--    DISTINCT ON (hive_id) ... WHERE user_id = auth.uid() ORDER BY hive_id, inspected_at DESC.
--    Ingen eksisterende indeks dekker (user_id, hive_id, inspected_at DESC) samlet, så
--    user_id-filteret + DISTINCT ON krever sortering. Denne lar planneren gjøre et
--    index-only-traversal — den enkeltspørringen som rammer hver dashboard-lasting.
CREATE INDEX IF NOT EXISTS idx_inspections_user_hive_inspected
  ON inspections (user_id, hive_id, inspected_at DESC);

-- 2) fetchSwarmReports henter WHERE status='open' AND reported_at >= now()-30d
--    ORDER BY reported_at DESC. Resolverte rapporter hoper seg opp over tid; en
--    partiell indeks holder seg liten og dekker filter + sortering eksakt.
CREATE INDEX IF NOT EXISTS idx_swarm_reports_open_reported
  ON swarm_reports (reported_at DESC)
  WHERE status = 'open';
