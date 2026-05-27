ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tier_locked boolean NOT NULL DEFAULT false;
