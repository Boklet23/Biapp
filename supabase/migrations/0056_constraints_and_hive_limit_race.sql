-- Multi-agent review v4 (2026-11-10): manglende CHECK-constraints + TOCTOU-race
-- i kubegrense-triggeren fra 0046.

-- ============================================================
-- A) CHECK-constraints (harvest_records/inspections hadde dette fra før;
--    disse kolonnene manglet tilsvarende)
-- ============================================================
ALTER TABLE hive_weights
  ADD CONSTRAINT hive_weights_weight_kg_positive CHECK (weight_kg > 0);

ALTER TABLE hives
  ADD CONSTRAINT hives_num_boxes_positive CHECK (num_boxes > 0),
  ADD CONSTRAINT hives_frames_per_box_positive CHECK (frames_per_box > 0);

ALTER TABLE inspections
  ADD CONSTRAINT inspections_varroa_ai_count_nonneg CHECK (varroa_ai_count >= 0);

ALTER TABLE queens
  ADD CONSTRAINT queens_replaced_after_introduced
    CHECK (replaced_at IS NULL OR replaced_at >= introduced_at);

-- ============================================================
-- B) Kubegrense-trigger: lukk TOCTOU-racen fra 0046
--    (to samtidige INSERT fra samme starter-bruker kunne begge lese count=2
--    og begge passere — dobbelttrykk eller to enheter var nok).
--    Advisory-lås per bruker serialiserer sjekken; slippes ved COMMIT.
--    Semantikken ellers er identisk med 0046.
-- ============================================================
CREATE OR REPLACE FUNCTION enforce_starter_hive_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier text;
  v_trial timestamptz;
  v_active_count bigint;
BEGIN
  -- Kun relevant når raden ender som aktiv
  IF NEW.is_active IS DISTINCT FROM true THEN
    RETURN NEW;
  END IF;
  -- Ved UPDATE: kun reaktivering teller (redigering av allerede aktiv kube er fritt)
  IF TG_OP = 'UPDATE' AND OLD.is_active = true THEN
    RETURN NEW;
  END IF;

  -- Serialiserer samtidige INSERT/reaktiveringer fra SAMME bruker for hele
  -- transaksjonen (slippes ved COMMIT/ROLLBACK). Nøkkelen er per bruker, så
  -- andre brukere blokkeres ikke. Hash-kollisjon mellom to brukere koster kun
  -- et harmløst kort lås-vent — aldri feil telling.
  PERFORM pg_advisory_xact_lock(hashtext(NEW.user_id::text));

  SELECT subscription_tier::text, trial_expires_at
    INTO v_tier, v_trial
    FROM profiles
   WHERE id = NEW.user_id;

  IF v_tier IS DISTINCT FROM 'starter' THEN
    RETURN NEW;
  END IF;
  IF v_trial IS NOT NULL AND v_trial > now() THEN
    RETURN NEW;
  END IF;

  SELECT count(*)
    INTO v_active_count
    FROM hives
   WHERE user_id = NEW.user_id
     AND is_active = true
     AND (TG_OP = 'INSERT' OR id <> NEW.id);

  IF v_active_count >= 3 THEN
    RAISE EXCEPTION 'Starter-abonnementet er begrenset til 3 aktive kuber. Oppgrader for flere.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;
