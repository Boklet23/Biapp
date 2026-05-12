create table public.equipment_vendors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  website     text not null,
  phone       text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  updated_at  timestamptz not null default now()
);

alter table public.equipment_vendors enable row level security;

create policy "Alle kan lese utstyrsleverandører"
on public.equipment_vendors for select
to authenticated
using (is_active = true);
