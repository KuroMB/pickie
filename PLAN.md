# Pickie Improvement Plan

## Part 1: Emoji custom input (AddMealModal)

**What:** Keep the 21 preset emoji buttons but hide the plain text input by default. Replace it with a small "+ add your own" toggle button. Tapping it expands a focused text input with a hint ("tap 🌐 on your keyboard").

**Files:** `src/components/planner/AddMealModal.tsx`

**Changes:**
- Add `showCustomEmoji` boolean state, default false
- Replace the always-visible text input with a "+ add your own" button
- When `showCustomEmoji` is true, render the text input (auto-focused) with hint text below it
- If user already has a custom emoji set (edit mode), show the input expanded by default

---

## Part 2: In-app polls (biggest gap)

**What:** Right now polls are fire-and-forget emails. The pollId is generated but never stored, and there's nowhere in the app to see or respond to a poll. Members need an in-app poll experience; planners need to see results.

**Schema changes (Supabase migration):**
```sql
create table polls (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  created_by uuid references profiles(id),
  question text not null,
  option_a text not null,
  option_b text not null,
  closed boolean default false,
  created_at timestamptz default now()
);

create table poll_responses (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references polls(id) on delete cascade,
  user_id uuid references profiles(id),
  choice text not null check (choice in ('a', 'b')),
  created_at timestamptz default now(),
  unique(poll_id, user_id)
);

-- RLS: household members can view/insert their own responses; planners can view all
```

**API change:** `/api/notifications/poll` inserts a `polls` row first, uses its id as the pollId in emails.

**New components:**
- `PollCard` — shown in HomeFeed above suggestions when an open poll exists
  - Members: see question + two choice buttons; tapping submits a `poll_response`
  - Planners: see question + live A/B tally + "close poll" button
- HomeFeed fetches active (non-closed) polls for the household and passes to PollCard

**Files:**
- `src/components/home/HomeFeed.tsx` — fetch active polls, pass to PollCard
- `src/components/home/PollCard.tsx` — new component
- `src/app/api/notifications/poll/route.ts` — insert poll row before emailing
- `supabase/migrations/` — new migration for polls + poll_responses

---

## Part 3: Family insights page

**What:** Directly addresses the top hackathon feedback — "what does my family actually like?" Uses 100% existing data, no schema changes.

**New page:** `/insights`

**Sections:**
1. **Family favorites** — meals with average rating ≥ 8 across all raters, shown as a ranked list with the avg score and who rated what
2. **By person** — for each household member: their average rating given, their top 3 "love" votes, their most-rated meal
3. **Most loved** — top 5 meals by "love" vote count

**Files:**
- `src/app/insights/page.tsx` — server component, SQL aggregation queries
- `src/app/insights/loading.tsx` — skeleton
- `src/components/home/SideDrawer.tsx` — add "insights" nav link with chart icon

---

## Part 4: Meal type

**What:** The `meal_type` column (dinner/lunch/breakfast) already exists in the schema but is hardcoded to dinner everywhere. Unlock it with a UI selector.

**Changes:**
- `AddMealModal` — add a pill toggle: Dinner / Lunch / Breakfast (default: Dinner)
- `TonightHeroCard` — show a small type badge ("🌙 dinner", "☀️ lunch", "🌅 breakfast") below the meal name
- `MealCard` — same small badge in the collapsed view
- ComingUpSection label: if a date has mixed types, show them; otherwise just the day name

**Files:**
- `src/components/planner/AddMealModal.tsx`
- `src/components/home/TonightHeroCard.tsx`
- `src/components/home/MealCard.tsx`

---

## Suggested order

1. Part 1 (emoji toggle) — 15 min, isolated, can ship immediately
2. Part 4 (meal type) — 30 min, no schema changes, rounds out existing features
3. Part 3 (insights) — 45 min, high hackathon value, no schema changes
4. Part 2 (in-app polls) — 1-2 hours, schema migration + new component

Parts 1, 3, and 4 can be done with zero database changes.
