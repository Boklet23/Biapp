-- 0006: varroabehandling og behandlingslogg
create table public.treatments (
  id          uuid        primary key default gen_random_uuid(),
  hive_id     uuid        not null references public.hives(id) on delete cascade,
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  treated_at  date        not null,
  product     text        not null,
  dose        text,
  method      text,
  notes       text,
  created_at  timestamptz not null default now()
);

alter table public.treatments enable row level security;

create policy "Users can manage own treatments"
  on public.treatments for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

create index treatments_hive_date_idx on public.treatments(hive_id, treated_at desc);
