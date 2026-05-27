-- Ytelsesoptimalisering: bruk (SELECT auth.uid()) i RLS-policyer.
-- auth.uid() evalueres per rad; (SELECT auth.uid()) evalueres én gang per query.
-- Gir lineær ytelsesgevinst ved tabeller med mange rader per bruker.

-- profiles
DROP POLICY IF EXISTS "profiles: les egne" ON profiles;
DROP POLICY IF EXISTS "profiles: oppdater egne" ON profiles;
CREATE POLICY "profiles: les egne"      ON profiles FOR SELECT USING ((SELECT auth.uid()) = id);
CREATE POLICY "profiles: oppdater egne" ON profiles FOR UPDATE USING ((SELECT auth.uid()) = id);

-- hives
DROP POLICY IF EXISTS "hives: opprett egne" ON hives;
DROP POLICY IF EXISTS "hives: oppdater egne" ON hives;
DROP POLICY IF EXISTS "hives: slett egne" ON hives;
CREATE POLICY "hives: opprett egne" ON hives FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "hives: oppdater egne" ON hives FOR UPDATE  USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "hives: slett egne"   ON hives FOR DELETE  USING ((SELECT auth.uid()) = user_id);

-- inspections
DROP POLICY IF EXISTS "inspections: les egne" ON inspections;
DROP POLICY IF EXISTS "inspections: opprett egne" ON inspections;
DROP POLICY IF EXISTS "inspections: oppdater egne" ON inspections;
DROP POLICY IF EXISTS "inspections: slett egne" ON inspections;
CREATE POLICY "inspections: les egne"      ON inspections FOR SELECT USING     ((SELECT auth.uid()) = user_id);
CREATE POLICY "inspections: opprett egne"  ON inspections FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "inspections: oppdater egne" ON inspections FOR UPDATE USING     ((SELECT auth.uid()) = user_id);
CREATE POLICY "inspections: slett egne"    ON inspections FOR DELETE USING     ((SELECT auth.uid()) = user_id);

-- harvest_records
DROP POLICY IF EXISTS "harvest: les egne" ON harvest_records;
DROP POLICY IF EXISTS "harvest: opprett egne" ON harvest_records;
DROP POLICY IF EXISTS "harvest: oppdater egne" ON harvest_records;
DROP POLICY IF EXISTS "harvest: slett egne" ON harvest_records;
CREATE POLICY "harvest: les egne"      ON harvest_records FOR SELECT USING     ((SELECT auth.uid()) = user_id);
CREATE POLICY "harvest: opprett egne"  ON harvest_records FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "harvest: oppdater egne" ON harvest_records FOR UPDATE USING     ((SELECT auth.uid()) = user_id);
CREATE POLICY "harvest: slett egne"    ON harvest_records FOR DELETE USING     ((SELECT auth.uid()) = user_id);

-- treatments
DROP POLICY IF EXISTS "Users can manage own treatments" ON treatments;
CREATE POLICY "Users can manage own treatments" ON treatments
  FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- hive_weights
DROP POLICY IF EXISTS "Users can manage own hive weights" ON hive_weights;
CREATE POLICY "Users can manage own hive weights" ON hive_weights
  FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- queens
DROP POLICY IF EXISTS "queens_owner" ON queens;
CREATE POLICY "queens_owner" ON queens
  FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- swarm_reports (insert/update — select allerede fikset i 0037)
DROP POLICY IF EXISTS "swarm_reports: opprett egne" ON swarm_reports;
DROP POLICY IF EXISTS "swarm_reports: oppdater egne" ON swarm_reports;
CREATE POLICY "swarm_reports: opprett egne" ON swarm_reports FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "swarm_reports: oppdater egne" ON swarm_reports FOR UPDATE  USING ((SELECT auth.uid()) = user_id);

-- calendar_events
DROP POLICY IF EXISTS "calendar_events: les egne" ON calendar_events;
DROP POLICY IF EXISTS "calendar_events: opprett egne" ON calendar_events;
DROP POLICY IF EXISTS "calendar_events: oppdater egne" ON calendar_events;
DROP POLICY IF EXISTS "calendar_events: slett egne" ON calendar_events;
CREATE POLICY "calendar_events: les egne"      ON calendar_events FOR SELECT USING     ((SELECT auth.uid()) = user_id);
CREATE POLICY "calendar_events: opprett egne"  ON calendar_events FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "calendar_events: oppdater egne" ON calendar_events FOR UPDATE USING     ((SELECT auth.uid()) = user_id);
CREATE POLICY "calendar_events: slett egne"    ON calendar_events FOR DELETE USING     ((SELECT auth.uid()) = user_id);

-- hive_collaborators
DROP POLICY IF EXISTS "hive_collaborators: owner manages" ON hive_collaborators;
DROP POLICY IF EXISTS "hive_collaborators: collaborator reads" ON hive_collaborators;
CREATE POLICY "hive_collaborators: owner manages" ON hive_collaborators
  FOR ALL
  USING     (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));
CREATE POLICY "hive_collaborators: collaborator reads" ON hive_collaborators
  FOR SELECT USING (collaborator_id = (SELECT auth.uid()));
