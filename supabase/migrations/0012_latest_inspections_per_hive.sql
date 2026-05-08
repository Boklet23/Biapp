-- Migration 0012: DB function for latest inspection per hive (DISTINCT ON)
-- Replaces the in-memory client-side deduplication that broke with large datasets

create or replace function get_latest_inspections_per_hive()
returns table (
  id                uuid,
  hive_id           uuid,
  user_id           uuid,
  inspected_at      timestamptz,
  varroa_count      int,
  queen_seen        bool,
  queen_cells_found bool,
  mood_score        int
)
language sql
stable
security invoker
as $$
  select distinct on (hive_id)
    id, hive_id, user_id, inspected_at,
    varroa_count, queen_seen, queen_cells_found, mood_score
  from inspections
  where user_id = auth.uid()
  order by hive_id, inspected_at desc;
$$;
