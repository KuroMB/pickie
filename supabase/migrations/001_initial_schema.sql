-- pickie initial schema
-- run this in Supabase SQL editor or via Supabase CLI

-- households
create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now(),
  invite_code text unique not null default upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 6))
);

-- profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  household_id uuid references households(id) on delete set null,
  name text not null,
  email text not null,
  role text check (role in ('planner', 'member')) not null default 'member',
  notification_preference text check (notification_preference in ('email')) not null default 'email',
  created_at timestamptz default now()
);

-- meals
create table meals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  description text,
  emoji text,
  scheduled_date date not null,
  meal_type text check (meal_type in ('dinner', 'breakfast', 'lunch')) not null default 'dinner',
  cook_time_minutes int,
  locked bool not null default false,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references meals(id) on delete cascade,
  household_id uuid not null references households(id) on delete cascade,
  label text not null,
  claimed_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- votes
create table votes (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references meals(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  household_id uuid not null references households(id) on delete cascade,
  value text check (value in ('love', 'meh', 'nope')) not null,
  created_at timestamptz default now(),
  unique (meal_id, user_id)
);

-- ratings
create table ratings (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references meals(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  household_id uuid not null references households(id) on delete cascade,
  score int check (score between 1 and 10) not null,
  created_at timestamptz default now(),
  unique (meal_id, user_id)
);

-- suggestions
create table suggestions (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid references meals(id) on delete set null,
  household_id uuid not null references households(id) on delete cascade,
  submitted_by uuid not null references profiles(id) on delete cascade,
  type text check (type in ('remix', 'general')) not null,
  text text not null,
  status text check (status in ('open', 'noted', 'added')) not null default 'open',
  upvotes int not null default 0,
  created_at timestamptz default now()
);

-- suggestion_upvotes
create table suggestion_upvotes (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid not null references suggestions(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (suggestion_id, user_id)
);

-- notification_log
create table notification_log (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  type text check (type in ('new_meal', 'rating_reminder', 'ad_hoc_poll')) not null,
  sent_at timestamptz default now(),
  recipient_count int not null default 0
);

-- =====================
-- Row Level Security
-- =====================

alter table households enable row level security;
alter table profiles enable row level security;
alter table meals enable row level security;
alter table tasks enable row level security;
alter table votes enable row level security;
alter table ratings enable row level security;
alter table suggestions enable row level security;
alter table suggestion_upvotes enable row level security;
alter table notification_log enable row level security;

-- helper: get calling user's household_id
create or replace function auth_household_id()
returns uuid language sql stable security definer as $$
  select household_id from profiles where id = auth.uid()
$$;

-- helper: get calling user's role
create or replace function auth_user_role()
returns text language sql stable security definer as $$
  select role from profiles where id = auth.uid()
$$;

-- households
create policy "members view own household"
  on households for select
  using (id = auth_household_id());

create policy "authenticated users create household"
  on households for insert
  with check (auth.uid() is not null);

-- profiles
create policy "view household profiles"
  on profiles for select
  using (household_id = auth_household_id() or id = auth.uid());

create policy "insert own profile"
  on profiles for insert
  with check (id = auth.uid());

create policy "update own profile"
  on profiles for update
  using (id = auth.uid());

-- meals
create policy "view household meals"
  on meals for select
  using (household_id = auth_household_id());

create policy "planners insert meals"
  on meals for insert
  with check (
    household_id = auth_household_id()
    and auth_user_role() = 'planner'
  );

create policy "planners update meals"
  on meals for update
  using (
    household_id = auth_household_id()
    and auth_user_role() = 'planner'
  );

create policy "planners delete meals"
  on meals for delete
  using (
    household_id = auth_household_id()
    and auth_user_role() = 'planner'
  );

-- tasks
create policy "view household tasks"
  on tasks for select
  using (household_id = auth_household_id());

create policy "planners create tasks"
  on tasks for insert
  with check (
    household_id = auth_household_id()
    and auth_user_role() = 'planner'
  );

create policy "members claim tasks"
  on tasks for update
  using (household_id = auth_household_id());

create policy "planners delete tasks"
  on tasks for delete
  using (
    household_id = auth_household_id()
    and auth_user_role() = 'planner'
  );

-- votes
create policy "view household votes"
  on votes for select
  using (household_id = auth_household_id());

create policy "members vote"
  on votes for insert
  with check (
    household_id = auth_household_id()
    and user_id = auth.uid()
  );

create policy "members update own vote"
  on votes for update
  using (user_id = auth.uid() and household_id = auth_household_id());

create policy "members delete own vote"
  on votes for delete
  using (user_id = auth.uid() and household_id = auth_household_id());

-- ratings
create policy "view household ratings"
  on ratings for select
  using (household_id = auth_household_id());

create policy "members submit rating"
  on ratings for insert
  with check (
    household_id = auth_household_id()
    and user_id = auth.uid()
  );

create policy "members update own rating"
  on ratings for update
  using (user_id = auth.uid() and household_id = auth_household_id());

-- suggestions
create policy "view household suggestions"
  on suggestions for select
  using (household_id = auth_household_id());

create policy "members submit suggestions"
  on suggestions for insert
  with check (
    household_id = auth_household_id()
    and submitted_by = auth.uid()
  );

create policy "planners update suggestion status"
  on suggestions for update
  using (
    household_id = auth_household_id()
    and auth_user_role() = 'planner'
  );

-- suggestion_upvotes
create policy "view upvotes"
  on suggestion_upvotes for select
  using (
    exists (
      select 1 from suggestions
      where suggestions.id = suggestion_upvotes.suggestion_id
        and suggestions.household_id = auth_household_id()
    )
  );

create policy "members upvote"
  on suggestion_upvotes for insert
  with check (user_id = auth.uid());

create policy "members remove upvote"
  on suggestion_upvotes for delete
  using (user_id = auth.uid());

-- notification_log (planners only)
create policy "planners view notification log"
  on notification_log for select
  using (
    household_id = auth_household_id()
    and auth_user_role() = 'planner'
  );

-- =====================
-- Triggers
-- =====================

-- auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- keep suggestion upvote count in sync
create or replace function sync_suggestion_upvotes()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    update suggestions set upvotes = upvotes + 1 where id = new.suggestion_id;
  elsif tg_op = 'DELETE' then
    update suggestions set upvotes = greatest(0, upvotes - 1) where id = old.suggestion_id;
  end if;
  return null;
end;
$$;

create trigger on_upvote_change
  after insert or delete on suggestion_upvotes
  for each row execute procedure sync_suggestion_upvotes();

-- =====================
-- Indexes
-- =====================

create index meals_household_date on meals (household_id, scheduled_date);
create index tasks_meal_id on tasks (meal_id);
create index votes_meal_id on votes (meal_id);
create index ratings_meal_id on ratings (meal_id);
create index suggestions_household_id on suggestions (household_id, created_at desc);
create index profiles_household_id on profiles (household_id);
