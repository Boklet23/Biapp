-- Kubedeling (Lag-tier) har aldri kunnet virke mot prod:
--  1) addCollaboratorByEmail slo opp profiles.email — kolonnen finnes ikke,
--     og RLS («les egne») ville uansett blokkert oppslag av andre brukere.
--  2) fetchCollaborators joinet profiles(email, display_name) — samme problem.
--  3) PRIVILEGIE-ESKALERING: «owner manages»-policyen sjekket bare
--     owner_id = auth.uid(), IKKE at innskyteren eier kuben. Hvem som helst
--     kunne inserte (hive_id=<andres kube>, owner_id=meg, collaborator_id=meg)
--     og gi seg selv lesetilgang til kuben + inspeksjonene via
--     «les via samarbeid»-policyene fra 0008.

-- ── 3) Tett eskaleringen: innskyter må faktisk eie kuben ──────────────────
DROP POLICY IF EXISTS "hive_collaborators: owner manages" ON hive_collaborators;
CREATE POLICY "hive_collaborators: owner manages" ON hive_collaborators
  FOR ALL
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (
    owner_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM hives h
       WHERE h.id = hive_collaborators.hive_id
         AND h.user_id = (SELECT auth.uid())
    )
  );

-- ── 1) E-postoppslag for invitasjon ────────────────────────────────────────
-- SECURITY DEFINER fordi e-post bor i auth.users. Gated til Lag-tier så
-- funksjonen ikke kan brukes til fri konto-enumerering. Returnerer kun uuid.
CREATE OR REPLACE FUNCTION lookup_user_id_by_email(p_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_tier   text;
  v_target uuid;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Ikke innlogget';
  END IF;

  SELECT subscription_tier::text INTO v_tier FROM profiles WHERE id = v_caller;
  IF v_tier IS DISTINCT FROM 'lag' THEN
    RAISE EXCEPTION 'Kubedeling krever Lag-abonnement';
  END IF;

  SELECT u.id INTO v_target
    FROM auth.users u
   WHERE lower(u.email) = lower(trim(p_email))
   LIMIT 1;

  RETURN v_target; -- null hvis ingen treff
END;
$$;

REVOKE EXECUTE ON FUNCTION lookup_user_id_by_email(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION lookup_user_id_by_email(text) TO authenticated;

-- ── 2) Samarbeidsliste med e-post og navn ──────────────────────────────────
-- Kun kubens eier eller en eksisterende samarbeidspartner får lese lista.
CREATE OR REPLACE FUNCTION get_hive_collaborators(p_hive_id uuid)
RETURNS TABLE (
  id              uuid,
  hive_id         uuid,
  collaborator_id uuid,
  invited_at      timestamptz,
  email           text,
  display_name    text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Ikke innlogget';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM hives h
     WHERE h.id = p_hive_id
       AND (
         h.user_id = v_caller
         OR EXISTS (
           SELECT 1 FROM hive_collaborators hc
            WHERE hc.hive_id = p_hive_id AND hc.collaborator_id = v_caller
         )
       )
  ) THEN
    RAISE EXCEPTION 'Ingen tilgang til denne kuben';
  END IF;

  RETURN QUERY
  SELECT hc.id, hc.hive_id, hc.collaborator_id, hc.invited_at,
         u.email::text, p.display_name
    FROM hive_collaborators hc
    JOIN auth.users u ON u.id = hc.collaborator_id
    LEFT JOIN profiles p ON p.id = hc.collaborator_id
   WHERE hc.hive_id = p_hive_id
   ORDER BY hc.invited_at;
END;
$$;

REVOKE EXECUTE ON FUNCTION get_hive_collaborators(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION get_hive_collaborators(uuid) TO authenticated;
