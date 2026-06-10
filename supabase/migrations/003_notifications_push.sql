-- In-app notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  household_id uuid not null references households(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  url text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_unread_idx on notifications(user_id, read, created_at desc);
alter table notifications enable row level security;
create policy "users can view own notifications" on notifications for select using (user_id = auth.uid());
create policy "users can update own notifications" on notifications for update using (user_id = auth.uid());
-- No INSERT policy needed: service role bypasses RLS, and clients should never insert notifications directly.

-- Push subscriptions
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  household_id uuid not null references households(id) on delete cascade,
  endpoint text not null,
  subscription jsonb not null,
  created_at timestamptz not null default now(),
  unique(user_id, endpoint)
);
alter table push_subscriptions enable row level security;
create policy "users can manage own push subscriptions" on push_subscriptions for all using (user_id = auth.uid());

-- Dated suggestion fields
alter table suggestions
  add column if not exists suggested_date date,
  add column if not exists suggested_emoji text,
  add column if not exists suggested_description text,
  add column if not exists suggested_cook_time_minutes integer,
  add column if not exists declined_at timestamptz;
