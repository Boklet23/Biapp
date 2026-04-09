-- Erfaringsdeling: enkel foto-feed for norske birøktere
create table if not exists feed_posts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  content    text not null,
  image_url  text,
  likes      integer not null default 0,
  created_at timestamptz not null default now()
);

alter table feed_posts enable row level security;

-- Alle innloggede brukere kan lese innlegg
create policy "feed_read"
  on feed_posts for select
  using (auth.uid() is not null);

-- Eier kan opprette og slette egne innlegg
create policy "feed_owner"
  on feed_posts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index feed_created_idx on feed_posts(created_at desc);
create index feed_user_idx on feed_posts(user_id);

-- Likes-tabell (for å hindre dobbelliking)
create table if not exists feed_likes (
  id      uuid primary key default gen_random_uuid(),
  post_id uuid not null references feed_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  unique(post_id, user_id)
);

alter table feed_likes enable row level security;

create policy "feed_likes_all"
  on feed_likes for all
  using (auth.uid() is not null)
  with check (auth.uid() = user_id);
