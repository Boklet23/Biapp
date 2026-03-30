-- Migration 0003: Harvest records table
-- Run this in the Supabase SQL Editor

create table harvest_records (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  hive_id      uuid not null references hives(id) on delete cascade,
  harvested_at date not null,
  quantity_kg  numeric(6,2) not null check (quantity_kg > 0),
  notes        text,
  created_at   timestamptz not null default now()
);

create index idx_harvest_user on harvest_records(user_id, harvested_at);

alter table harvest_records enable row level security;

create policy "harvest: les egne"
  on harvest_records for select
  using (auth.uid() = user_id);

create policy "harvest: opprett egne"
  on harvest_records for insert
  with check (auth.uid() = user_id);

create policy "harvest: oppdater egne"
  on harvest_records for update
  using (auth.uid() = user_id);

create policy "harvest: slett egne"
  on harvest_records for delete
  using (auth.uid() = user_id);
