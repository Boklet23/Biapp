-- BiApp initial schema
-- Region: eu-west-1 (GDPR + lav latens fra Norge)
-- Kjør: paste inn i Supabase SQL Editor eller via supabase db push

-- ─────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────
create type experience_level as enum ('nybegynner', 'erfaren', 'profesjonell');
create type hive_type as enum ('langstroth', 'warre', 'toppstang', 'annet');
create type subscription_tier as enum ('starter', 'hobbyist', 'profesjonell', 'lag');
create type team_role as enum ('owner', 'admin', 'member');
create type disease_severity as enum ('lav', 'moderat', 'alvorlig', 'kritisk');
create type media_type as enum ('image', 'video');

-- ─────────────────────────────────────────────
-- MUNICIPALITIES
-- ─────────────────────────────────────────────
create table municipalities (
  id       serial primary key,
  name     text not null,
  county   text not null,
  lat      double precision not null,
  lng      double precision not null
);

-- ─────────────────────────────────────────────
-- TEAMS
-- ─────────────────────────────────────────────
create table teams (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  owner_id    uuid not null references auth.users(id) on delete cascade,
  max_members int not null default 50,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- USER PROFILES (extends auth.users)
-- ─────────────────────────────────────────────
create table profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  display_name      text,
  municipality_id   int references municipalities(id),
  experience_level  experience_level,
  subscription_tier subscription_tier not null default 'starter',
  team_id           uuid references teams(id),
  created_at        timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─────────────────────────────────────────────
-- TEAM MEMBERS
-- ─────────────────────────────────────────────
create table team_members (
  id         uuid primary key default uuid_generate_v4(),
  team_id    uuid not null references teams(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       team_role not null default 'member',
  joined_at  timestamptz not null default now(),
  unique(team_id, user_id)
);

-- ─────────────────────────────────────────────
-- HIVES
-- ─────────────────────────────────────────────
create table hives (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  type          hive_type not null default 'langstroth',
  location_lat  double precision,
  location_lng  double precision,
  location_name text,
  is_active     boolean not null default true,
  notes         text,
  created_at    timestamptz not null default now()
);

create index idx_hives_user_id on hives(user_id);

-- ─────────────────────────────────────────────
-- INSPECTIONS
-- ─────────────────────────────────────────────
create table inspections (
  id                   uuid primary key default uuid_generate_v4(),
  hive_id              uuid not null references hives(id) on delete cascade,
  user_id              uuid not null references auth.users(id) on delete cascade,
  inspected_at         timestamptz not null default now(),
  -- Steg 1: Grunninfo
  weather_temp         numeric(4,1),
  weather_condition    text,
  -- Steg 2: Kubestatus
  num_frames_brood     int check (num_frames_brood >= 0),
  num_frames_honey     int check (num_frames_honey >= 0),
  num_frames_empty     int check (num_frames_empty >= 0),
  queen_seen           boolean not null default false,
  queen_cells_found    boolean not null default false,
  -- Steg 3: Helse
  varroa_count         int check (varroa_count >= 0),
  varroa_method        text,
  disease_observations jsonb,
  treatment_applied    boolean not null default false,
  treatment_product    text,
  -- Steg 4: Notater
  notes                text,
  mood_score           int check (mood_score between 1 and 5),
  created_at           timestamptz not null default now()
);

create index idx_inspections_hive_id on inspections(hive_id);
create index idx_inspections_user_id on inspections(user_id);
create index idx_inspections_inspected_at on inspections(inspected_at desc);

-- ─────────────────────────────────────────────
-- INSPECTION MEDIA
-- ─────────────────────────────────────────────
create table inspection_media (
  id             uuid primary key default uuid_generate_v4(),
  inspection_id  uuid not null references inspections(id) on delete cascade,
  storage_path   text not null,
  media_type     media_type not null default 'image',
  created_at     timestamptz not null default now()
);

create index idx_inspection_media_inspection_id on inspection_media(inspection_id);

-- ─────────────────────────────────────────────
-- DISEASES
-- ─────────────────────────────────────────────
create table diseases (
  id             uuid primary key default uuid_generate_v4(),
  slug           text not null unique,
  name_no        text not null,
  is_notifiable  boolean not null default false,
  severity       disease_severity not null,
  description    text not null,
  symptoms       text not null,
  treatment      text not null,
  prevention     text not null,
  thumbnail_path text
);

-- ─────────────────────────────────────────────
-- HIVE DISEASE FLAGS
-- ─────────────────────────────────────────────
create table hive_disease_flags (
  id           uuid primary key default uuid_generate_v4(),
  hive_id      uuid not null references hives(id) on delete cascade,
  disease_id   uuid not null references diseases(id),
  flagged_at   timestamptz not null default now(),
  resolved_at  timestamptz,
  notes        text
);

create index idx_disease_flags_hive_id on hive_disease_flags(hive_id);

-- ─────────────────────────────────────────────
-- BEEKEEPER ASSOCIATIONS
-- ─────────────────────────────────────────────
create table beekeeper_associations (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  municipality_ids  int[] not null default '{}',
  contact_email     text,
  website           text,
  founded_year      int,
  member_count      int
);

-- ─────────────────────────────────────────────
-- SWARM REPORTS
-- ─────────────────────────────────────────────
create table swarm_reports (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  lat          double precision not null,
  lng          double precision not null,
  reported_at  timestamptz not null default now(),
  status       text not null default 'open' check (status in ('open', 'resolved')),
  description  text
);

create index idx_swarm_reports_reported_at on swarm_reports(reported_at desc);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

-- profiles
alter table profiles enable row level security;
create policy "profiles: les egne" on profiles for select using (auth.uid() = id);
create policy "profiles: oppdater egne" on profiles for update using (auth.uid() = id);

-- hives
alter table hives enable row level security;
create policy "hives: les egne" on hives for select
  using (auth.uid() = user_id);
create policy "hives: les via team" on hives for select
  using (
    exists (
      select 1 from team_members tm
      join profiles p on p.team_id = tm.team_id
      where tm.user_id = auth.uid()
        and p.id = hives.user_id
        and tm.role in ('owner', 'admin')
    )
  );
create policy "hives: opprett egne" on hives for insert with check (auth.uid() = user_id);
create policy "hives: oppdater egne" on hives for update using (auth.uid() = user_id);
create policy "hives: slett egne" on hives for delete using (auth.uid() = user_id);

-- inspections
alter table inspections enable row level security;
create policy "inspections: les egne" on inspections for select using (auth.uid() = user_id);
create policy "inspections: opprett egne" on inspections for insert with check (auth.uid() = user_id);
create policy "inspections: oppdater egne" on inspections for update using (auth.uid() = user_id);
create policy "inspections: slett egne" on inspections for delete using (auth.uid() = user_id);

-- inspection_media
alter table inspection_media enable row level security;
create policy "inspection_media: les egne" on inspection_media for select
  using (exists (select 1 from inspections i where i.id = inspection_id and i.user_id = auth.uid()));
create policy "inspection_media: opprett egne" on inspection_media for insert
  with check (exists (select 1 from inspections i where i.id = inspection_id and i.user_id = auth.uid()));
create policy "inspection_media: slett egne" on inspection_media for delete
  using (exists (select 1 from inspections i where i.id = inspection_id and i.user_id = auth.uid()));

-- diseases: alle kan lese
alter table diseases enable row level security;
create policy "diseases: alle kan lese" on diseases for select using (true);

-- hive_disease_flags
alter table hive_disease_flags enable row level security;
create policy "disease_flags: les egne" on hive_disease_flags for select
  using (exists (select 1 from hives h where h.id = hive_id and h.user_id = auth.uid()));
create policy "disease_flags: opprett egne" on hive_disease_flags for insert
  with check (exists (select 1 from hives h where h.id = hive_id and h.user_id = auth.uid()));
create policy "disease_flags: oppdater egne" on hive_disease_flags for update
  using (exists (select 1 from hives h where h.id = hive_id and h.user_id = auth.uid()));

-- municipalities: alle kan lese
alter table municipalities enable row level security;
create policy "municipalities: alle kan lese" on municipalities for select using (true);

-- beekeeper_associations: alle kan lese
alter table beekeeper_associations enable row level security;
create policy "associations: alle kan lese" on beekeeper_associations for select using (true);

-- swarm_reports: alle kan se, egne kan opprette
alter table swarm_reports enable row level security;
create policy "swarm_reports: alle kan lese" on swarm_reports for select using (true);
create policy "swarm_reports: opprett egne" on swarm_reports for insert with check (auth.uid() = user_id);
create policy "swarm_reports: oppdater egne" on swarm_reports for update using (auth.uid() = user_id);

-- teams
alter table teams enable row level security;
create policy "teams: les egne" on teams for select
  using (exists (select 1 from team_members tm where tm.team_id = id and tm.user_id = auth.uid()));
create policy "teams: opprett" on teams for insert with check (auth.uid() = owner_id);

-- team_members
alter table team_members enable row level security;
create policy "team_members: les eget team" on team_members for select
  using (exists (select 1 from team_members tm2 where tm2.team_id = team_id and tm2.user_id = auth.uid()));
