-- Add bee_breed column to hives table
-- Run this in Supabase SQL Editor

ALTER TABLE hives
  ADD COLUMN IF NOT EXISTS bee_breed text
  CHECK (bee_breed IN ('norsk_landbee', 'buckfast', 'carniolan', 'annet'));
