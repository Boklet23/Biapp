-- GDPR: brukere har rett til å slette egne svermrapporter
CREATE POLICY "swarm_reports: eier kan slette" ON swarm_reports
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);
