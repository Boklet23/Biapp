-- 0008: kube-deling mellom brukere
create table public.hive_collaborators (
  id              uuid        primary key default gen_random_uuid(),
  hive_id         uuid        not null references public.hives(id) on delete cascade,
  owner_id        uuid        not null references public.profiles(id) on delete cascade,
  collaborator_id uuid        not null references public.profiles(id) on delete cascade,
  invited_at      timestamptz not null default now(),
  unique (hive_id, collaborator_id)
);

alter table public.hive_collaborators enable row level security;

create policy "hive_collaborators: owner manages"
  on public.hive_collaborators for all
  using  (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "hive_collaborators: collaborator reads"
  on public.hive_collaborators for select
  using (collaborator_id = auth.uid());

create policy "hives: les via samarbeid"
  on public.hives for select
  using (
    exists (
      select 1 from public.hive_collaborators hc
      where hc.hive_id = id and hc.collaborator_id = auth.uid()
    )
  );

create policy "inspections: les via samarbeid"
  on public.inspections for select
  using (
    exists (
      select 1 from public.hive_collaborators hc
      where hc.hive_id = hive_id and hc.collaborator_id = auth.uid()
    )
  );

create index hive_collaborators_hive_idx on public.hive_collaborators(hive_id);
create index hive_collaborators_collaborator_idx on public.hive_collaborators(collaborator_id);
