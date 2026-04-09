-- Birøkter-markedsplass: kjøp/salg av dronninger, avleggere og utstyr
create table if not exists marketplace_listings (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  description  text,
  category     text not null check (category in ('dronning','avlegger','utstyr','honning','annet')),
  price        numeric(10,2),
  price_unit   text default 'kr',
  location     text,
  contact_info text,
  is_active    boolean not null default true,
  sold_at      timestamptz,
  created_at   timestamptz not null default now()
);

alter table marketplace_listings enable row level security;

-- Alle innloggede brukere kan se aktive annonser
create policy "marketplace_read_active"
  on marketplace_listings for select
  using (auth.uid() is not null and is_active = true);

-- Eier kan gjøre alt med egne annonser
create policy "marketplace_owner"
  on marketplace_listings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index marketplace_category_idx on marketplace_listings(category);
create index marketplace_user_idx on marketplace_listings(user_id);
create index marketplace_created_idx on marketplace_listings(created_at desc);
