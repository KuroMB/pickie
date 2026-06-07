create table polls (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  created_by uuid not null references profiles(id),
  question text not null,
  option_a text not null,
  option_b text not null,
  closed boolean not null default false,
  created_at timestamptz not null default now()
);

create table poll_responses (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls(id) on delete cascade,
  user_id uuid not null references profiles(id),
  household_id uuid not null references households(id) on delete cascade,
  choice text not null check (choice in ('a', 'b')),
  created_at timestamptz not null default now(),
  unique(poll_id, user_id)
);

create index polls_household_created_idx on polls(household_id, created_at desc);
create index poll_responses_poll_idx on poll_responses(poll_id);

alter table polls enable row level security;
alter table poll_responses enable row level security;

create policy "household members can view polls"
  on polls for select
  using (
    household_id in (select household_id from profiles where id = auth.uid())
  );

create policy "planners can create polls"
  on polls for insert
  with check (
    created_by = auth.uid()
    and household_id in (
      select household_id from profiles where id = auth.uid() and role = 'planner'
    )
  );

create policy "planners can close polls"
  on polls for update
  using (
    household_id in (
      select household_id from profiles where id = auth.uid() and role = 'planner'
    )
  );

create policy "household members can view poll responses"
  on poll_responses for select
  using (
    household_id in (select household_id from profiles where id = auth.uid())
  );

create policy "members can submit poll responses"
  on poll_responses for insert
  with check (
    user_id = auth.uid()
    and household_id in (select household_id from profiles where id = auth.uid())
  );

create policy "members can update own poll response"
  on poll_responses for update
  using (user_id = auth.uid());
