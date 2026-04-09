-- Dronningsporing: logger dronningbytte, alder, rase og prestasjonshistorikk per kube
create table if not exists queens (
  id          uuid primary key default gen_random_uuid(),
  hive_id     uuid not null references hives(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  introduced_at date not null,
  replaced_at   date,
  origin      text,           -- f.eks. 'Egenoppdratt', 'Kjøpt', 'Naturlig sverm'
  breed       text,           -- norsk_landbee, buckfast, carniolan, annet
  marked_color text,          -- 'hvit','gul','rød','grønn','blå' (5-års-syklusen)
  notes       text,
  created_at  timestamptz not null default now()
);

alter table queens enable row level security;

create policy "queens_owner"
  on queens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index queens_hive_idx on queens(hive_id);
create index queens_user_idx on queens(user_id);
