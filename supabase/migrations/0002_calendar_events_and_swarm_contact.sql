-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0002: calendar_events + swarm_reports.contact_info
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Add missing contact_info column to swarm_reports
alter table swarm_reports add column if not exists contact_info text;

-- Add push_token column to profiles for Expo push notifications
alter table profiles add column if not exists push_token text;

-- ─────────────────────────────────────────────
-- CALENDAR EVENTS
-- ─────────────────────────────────────────────
create table if not exists calendar_events (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  title           text not null,
  event_date      date not null,
  notes           text,
  notification_id text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_calendar_events_user_date
  on calendar_events(user_id, event_date);

alter table calendar_events enable row level security;

create policy "calendar_events: les egne"
  on calendar_events for select using (auth.uid() = user_id);

create policy "calendar_events: opprett egne"
  on calendar_events for insert with check (auth.uid() = user_id);

create policy "calendar_events: oppdater egne"
  on calendar_events for update using (auth.uid() = user_id);

create policy "calendar_events: slett egne"
  on calendar_events for delete using (auth.uid() = user_id);
