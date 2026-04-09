-- 0007: kubevekt-logg
create table public.hive_weights (
  id          uuid           primary key default gen_random_uuid(),
  hive_id     uuid           not null references public.hives(id) on delete cascade,
  user_id     uuid           not null references public.profiles(id) on delete cascade,
  weighed_at  date           not null,
  weight_kg   numeric(6, 2)  not null,
  notes       text,
  created_at  timestamptz    not null default now()
);

alter table public.hive_weights enable row level security;

create policy "Users can manage own hive weights"
  on public.hive_weights for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

create index hive_weights_hive_date_idx on public.hive_weights(hive_id, weighed_at desc);
