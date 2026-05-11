-- Add trial_expires_at to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_expires_at timestamptz;

-- Trigger: grant 14-day Hobbyist trial to every new user
CREATE OR REPLACE FUNCTION set_trial_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.trial_expires_at IS NULL THEN
    NEW.trial_expires_at := NOW() + INTERVAL '14 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_trial_expires ON profiles;
CREATE TRIGGER set_trial_expires
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_trial_on_signup();
