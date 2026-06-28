-- Dubaikar — community, connections, notifications, bookmarks (enhancement pass).
-- Run in the Supabase SQL editor after 0001 + 0002.

-- ----------------------------------------------------------------------------
-- profiles: avatar · budgets: name
-- ----------------------------------------------------------------------------
alter table profiles add column if not exists avatar_url text;
alter table budgets add column if not exists title text;

-- Members directory: expose ONLY safe columns to other authenticated users via
-- a view (full profiles rows stay owner-only — no broad select policy, so
-- email/salary/visa can never be read cross-user through the API).
create view member_directory as
  select id, full_name, avatar_url, current_stage, industry, target_move_date
  from profiles
  where onboarded = true;
revoke all on member_directory from anon;
grant select on member_directory to authenticated;

-- ----------------------------------------------------------------------------
-- community posts / replies / likes
-- ----------------------------------------------------------------------------
create table community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null default 'questions',
  body text not null,
  deleted boolean not null default false,
  created_at timestamptz not null default now()
);
alter table community_posts enable row level security;
create policy "posts_read" on community_posts for select to authenticated using (deleted = false);
create policy "posts_insert_own" on community_posts for insert with check (auth.uid() = user_id);
create policy "posts_update_own" on community_posts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index posts_created_idx on community_posts (created_at desc);

create table community_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references community_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  deleted boolean not null default false,
  created_at timestamptz not null default now()
);
alter table community_replies enable row level security;
create policy "replies_read" on community_replies for select to authenticated using (deleted = false);
create policy "replies_insert_own" on community_replies for insert with check (auth.uid() = user_id);
create policy "replies_update_own" on community_replies for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index replies_post_idx on community_replies (post_id, created_at);

create table post_likes (
  post_id uuid not null references community_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table post_likes enable row level security;
create policy "likes_read" on post_likes for select to authenticated using (true);
create policy "likes_insert_own" on post_likes for insert with check (auth.uid() = user_id);
create policy "likes_delete_own" on post_likes for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- connections (find friends)
-- ----------------------------------------------------------------------------
create table connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users (id) on delete cascade,
  receiver_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (requester_id, receiver_id),
  check (requester_id <> receiver_id)
);
alter table connections enable row level security;
create policy "connections_select_party" on connections
  for select using (auth.uid() = requester_id or auth.uid() = receiver_id);
create policy "connections_insert_requester" on connections
  for insert with check (auth.uid() = requester_id);
create policy "connections_update_party" on connections
  for update using (auth.uid() = requester_id or auth.uid() = receiver_id)
  with check (auth.uid() = requester_id or auth.uid() = receiver_id);
create trigger connections_updated_at before update on connections
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- reports (moderation) — write-only for users, read via service role
-- ----------------------------------------------------------------------------
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  target_type text not null check (target_type in ('post','reply','user')),
  target_id text not null,
  reason text,
  created_at timestamptz not null default now()
);
alter table reports enable row level security;
create policy "reports_insert_own" on reports for insert with check (auth.uid() = reporter_id);

-- ----------------------------------------------------------------------------
-- notifications (in-app)
-- ----------------------------------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table notifications enable row level security;
create policy "notifications_select_own" on notifications for select using (auth.uid() = user_id);
create policy "notifications_update_own" on notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- inserts happen via service role (cross-user events) or self
create policy "notifications_insert_self" on notifications for insert with check (auth.uid() = user_id);
create index notifications_user_idx on notifications (user_id, read, created_at desc);

-- ----------------------------------------------------------------------------
-- bookmarks (map areas, guides)
-- ----------------------------------------------------------------------------
create table bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('area','guide')),
  ref_key text not null,
  created_at timestamptz not null default now(),
  unique (user_id, kind, ref_key)
);
alter table bookmarks enable row level security;
create policy "bookmarks_all_own" on bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
