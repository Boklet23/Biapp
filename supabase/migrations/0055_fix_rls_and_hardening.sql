-- Multi-agent review v4 (2026-11-10): RLS-korrelasjons-bugs funnet i PROD
-- (pg_policies-dump), ikke synlige i repo-historikken alene. Pluss herding
-- fra Supabase security/performance-advisors.

-- ============================================================
-- A) KRITISK: Korrupte RLS-korrelasjoner
-- ============================================================

-- A1. hives: 'les via samarbeid' hadde «hc.hive_id = hc.id» (selvsammenligning
--     pga. kolonneskyggelegging) — deling var død OG utnyttbar via klient-satt
--     id i hive_collaborators til å lese ALLE kuber (inkl. GPS). Slås sammen
--     med 'les egne' til én policy (fjerner også multiple-permissive-warn).
DROP POLICY IF EXISTS "hives: les egne" ON hives;
DROP POLICY IF EXISTS "hives: les via samarbeid" ON hives;
CREATE POLICY "hives: les egne eller delte" ON hives FOR SELECT USING (
  user_id = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1 FROM hive_collaborators hc
    WHERE hc.hive_id = hives.id AND hc.collaborator_id = (SELECT auth.uid())
  )
);

-- A2. inspections: 'les via samarbeid' hadde «hc.hive_id = hc.hive_id»
--     (ALLTID SANN) — enhver samarbeidspartner på én kube kunne lese ALLE
--     brukeres inspeksjoner.
DROP POLICY IF EXISTS "inspections: les egne" ON inspections;
DROP POLICY IF EXISTS "inspections: les via samarbeid" ON inspections;
CREATE POLICY "inspections: les egne eller delte" ON inspections FOR SELECT USING (
  user_id = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1 FROM hive_collaborators hc
    WHERE hc.hive_id = inspections.hive_id AND hc.collaborator_id = (SELECT auth.uid())
  )
);

-- A3. teams/team_members: samme selvsammenlignings-feil (tm.team_id = tm.id /
--     tm2.team_id = tm2.team_id) + selvreferende policy ga rekursjonsrisiko.
--     Definer-hjelper bryter rekursjonen.
CREATE OR REPLACE FUNCTION public.get_my_team_ids()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT team_id FROM team_members WHERE user_id = auth.uid() $$;
REVOKE EXECUTE ON FUNCTION public.get_my_team_ids() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_my_team_ids() TO authenticated;

DROP POLICY IF EXISTS "team_members: les eget team" ON team_members;
CREATE POLICY "team_members: les eget team" ON team_members FOR SELECT USING (
  user_id = (SELECT auth.uid()) OR team_id IN (SELECT public.get_my_team_ids())
);
DROP POLICY IF EXISTS "teams: les egne" ON teams;
CREATE POLICY "teams: les egne" ON teams FOR SELECT USING (
  owner_id = (SELECT auth.uid()) OR id IN (SELECT public.get_my_team_ids())
);

-- A4. Storage: 'Alle kan se hive-bilder' overlevde fra før bucketen ble privat
--     (0042) — alle innloggede kunne lese alles kubebilder. Visning bruker
--     lagrede signerte URL-er, så eier-policyen alene er trygg.
--     Dropper også det eldre duplikat-paret for INSERT/DELETE.
DROP POLICY IF EXISTS "Alle kan se hive-bilder" ON storage.objects;
DROP POLICY IF EXISTS "Autentiserte brukere kan laste opp bilder" ON storage.objects;
DROP POLICY IF EXISTS "Eier kan slette egne bilder" ON storage.objects;

-- ============================================================
-- B) Døde/duplikate policies + GDPR-lagringsminimering
-- ============================================================
DROP POLICY IF EXISTS "swarm_reports: alle kan lese aktive" ON swarm_reports;      -- status='active' finnes ikke ('open'/'resolved')
DROP POLICY IF EXISTS "swarm_reports: bruker kan opprette" ON swarm_reports;       -- duplikat av 'opprett egne'
DROP POLICY IF EXISTS "swarm_reports: bruker kan oppdatere egne" ON swarm_reports; -- duplikat av 'oppdater egne'
DROP POLICY IF EXISTS "calendar_events: eier kan alt" ON calendar_events;          -- granulære policies finnes for alle fire kommandoer

-- Svermrapporter (posisjon + kontaktinfo): 30-dagersvinduet lå kun i klienten.
-- Håndhev i RLS slik at glemte/aldri-løste rapporter ikke er lesbare for alle
-- for alltid (GDPR art. 5(1)(e) lagringsminimering).
DROP POLICY IF EXISTS "swarm_reports: innloggede kan lese" ON swarm_reports;
CREATE POLICY "swarm_reports: innloggede kan lese" ON swarm_reports
  FOR SELECT TO authenticated
  USING (
    (status = 'open' AND reported_at > now() - interval '30 days')
    OR (SELECT auth.uid()) = user_id
  );

-- Samarbeidspartner kan selv forlate et delt kube-forhold (innvendingsrett).
DROP POLICY IF EXISTS "hive_collaborators: samarbeidspartner kan forlate" ON hive_collaborators;
CREATE POLICY "hive_collaborators: samarbeidspartner kan forlate" ON hive_collaborators
  FOR DELETE USING (collaborator_id = (SELECT auth.uid()));

-- ============================================================
-- C) auth_rls_initplan: (SELECT auth.uid()) på gjenværende policies
--    (0039 dekket ikke disse — advisor flagget 25 policies)
-- ============================================================
DROP POLICY IF EXISTS "hives: opprett egne" ON hives;
CREATE POLICY "hives: opprett egne" ON hives FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "feed_likes_select" ON feed_likes;
DROP POLICY IF EXISTS "feed_likes_insert" ON feed_likes;
DROP POLICY IF EXISTS "feed_likes_delete" ON feed_likes;
CREATE POLICY "feed_likes_select" ON feed_likes FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "feed_likes_insert" ON feed_likes FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "feed_likes_delete" ON feed_likes FOR DELETE USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "users see own usage" ON ai_analysis_usage;
DROP POLICY IF EXISTS "users insert own usage" ON ai_analysis_usage;
CREATE POLICY "users see own usage" ON ai_analysis_usage FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users insert own usage" ON ai_analysis_usage FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "inspection_media: les egne" ON inspection_media;
DROP POLICY IF EXISTS "inspection_media: opprett egne" ON inspection_media;
DROP POLICY IF EXISTS "inspection_media: slett egne" ON inspection_media;
CREATE POLICY "inspection_media: les egne" ON inspection_media FOR SELECT USING (
  EXISTS (SELECT 1 FROM inspections i WHERE i.id = inspection_media.inspection_id AND i.user_id = (SELECT auth.uid())));
CREATE POLICY "inspection_media: opprett egne" ON inspection_media FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM inspections i WHERE i.id = inspection_media.inspection_id AND i.user_id = (SELECT auth.uid())));
CREATE POLICY "inspection_media: slett egne" ON inspection_media FOR DELETE USING (
  EXISTS (SELECT 1 FROM inspections i WHERE i.id = inspection_media.inspection_id AND i.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "disease_flags: les egne" ON hive_disease_flags;
DROP POLICY IF EXISTS "disease_flags: opprett egne" ON hive_disease_flags;
DROP POLICY IF EXISTS "disease_flags: oppdater egne" ON hive_disease_flags;
CREATE POLICY "disease_flags: les egne" ON hive_disease_flags FOR SELECT USING (
  EXISTS (SELECT 1 FROM hives h WHERE h.id = hive_disease_flags.hive_id AND h.user_id = (SELECT auth.uid())));
CREATE POLICY "disease_flags: opprett egne" ON hive_disease_flags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM hives h WHERE h.id = hive_disease_flags.hive_id AND h.user_id = (SELECT auth.uid())));
CREATE POLICY "disease_flags: oppdater egne" ON hive_disease_flags FOR UPDATE USING (
  EXISTS (SELECT 1 FROM hives h WHERE h.id = hive_disease_flags.hive_id AND h.user_id = (SELECT auth.uid())));
CREATE POLICY "disease_flags: slett egne" ON hive_disease_flags FOR DELETE USING (
  EXISTS (SELECT 1 FROM hives h WHERE h.id = hive_disease_flags.hive_id AND h.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "feed_read" ON feed_posts;
DROP POLICY IF EXISTS "feed_owner" ON feed_posts;
CREATE POLICY "feed_read" ON feed_posts FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "feed_owner_insert" ON feed_posts FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "feed_owner_update" ON feed_posts FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "feed_owner_delete" ON feed_posts FOR DELETE USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "marketplace_read_active" ON marketplace_listings;
DROP POLICY IF EXISTS "marketplace_owner" ON marketplace_listings;
CREATE POLICY "marketplace_read" ON marketplace_listings FOR SELECT USING (
  ((SELECT auth.uid()) IS NOT NULL AND is_active = true) OR (SELECT auth.uid()) = user_id);
CREATE POLICY "marketplace_owner_insert" ON marketplace_listings FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "marketplace_owner_update" ON marketplace_listings FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "marketplace_owner_delete" ON marketplace_listings FOR DELETE USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "teams: opprett" ON teams;
CREATE POLICY "teams: opprett" ON teams FOR INSERT WITH CHECK ((SELECT auth.uid()) = owner_id);

-- ============================================================
-- D) Funksjonsherding (security-advisors)
-- ============================================================
ALTER FUNCTION public.get_latest_inspections_per_hive() SET search_path = public;
ALTER FUNCTION public.set_trial_on_signup() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_trial_on_signup() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.get_map_hives() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_map_hives() TO authenticated;

-- ============================================================
-- E) Indekser: dropp 3 eksakte duplikater, legg til 9 FK-indekser
-- ============================================================
DROP INDEX IF EXISTS idx_calendar_events_user_date_perf;
DROP INDEX IF EXISTS idx_hive_weights_hive_weighed_desc;
DROP INDEX IF EXISTS idx_treatments_hive_treated_desc;

CREATE INDEX IF NOT EXISTS idx_feed_likes_user ON feed_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_hive_collaborators_owner ON hive_collaborators(owner_id);
CREATE INDEX IF NOT EXISTS idx_hive_disease_flags_disease ON hive_disease_flags(disease_id);
CREATE INDEX IF NOT EXISTS idx_hive_weights_user ON hive_weights(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_municipality ON profiles(municipality_id);
CREATE INDEX IF NOT EXISTS idx_profiles_team ON profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_swarm_reports_user ON swarm_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_teams_owner ON teams(owner_id);
