-- 0039 droppet og gjenskapte hives-policyene uten kubegrensen fra 0013/0020 (regresjon):
-- starter-brukere kunne opprette ubegrenset med kuber via direkte API-kall.
-- Gjenoppretter håndhevelsen som BEFORE-trigger i stedet for policy-subselect:
--  - presis på reaktivering (skiller redigering av aktiv kube fra reaktivering)
--  - anerkjenner aktiv prøveperiode (trial_expires_at > now()) som Hobbyist
--  - gir norsk feilmelding som kan vises direkte i klient-toast

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

DROP TRIGGER IF EXISTS enforce_starter_hive_limit ON hives;
CREATE TRIGGER enforce_starter_hive_limit
  BEFORE INSERT OR UPDATE OF is_active ON hives
  FOR EACH ROW
  EXECUTE FUNCTION enforce_starter_hive_limit();
