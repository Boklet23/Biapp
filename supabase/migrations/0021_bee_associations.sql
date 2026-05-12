create table public.bee_associations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  county      text not null,
  type        text not null default 'lokal'
              check (type in ('nasjonal', 'fylke', 'lokal')),
  website     text,
  email       text,
  phone       text,
  is_active   boolean not null default true,
  updated_at  timestamptz not null default now()
);

create index bee_associations_county_idx on public.bee_associations(county);
create index bee_associations_type_idx   on public.bee_associations(type);

alter table public.bee_associations enable row level security;

create policy "Alle kan lese birøkterlag"
on public.bee_associations for select
to authenticated
using (is_active = true);
