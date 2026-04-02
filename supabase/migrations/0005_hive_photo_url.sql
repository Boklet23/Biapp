-- Add photo_url column to hives table
-- Run this in Supabase SQL Editor

ALTER TABLE hives
  ADD COLUMN IF NOT EXISTS photo_url text;
