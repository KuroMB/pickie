# pickie — product spec

*family dinner planning app · v1.0*

-----

## vision

pickie is a mobile-first family dinner coordination app. the planner posts the week's meals, family members vote, suggest remixes, and claim tasks. feedback flows back to the planner to build a better rotation over time. the goal isn't just knowing what's for dinner — it's building a shared menu the whole family actually wants.

-----

## users & roles

### household members (mock: the black family)

|name   |role         |notification preference                  |
|-------|-------------|-----------------------------------------|
|Matt   |planner      |email                                    |
|MaryAnn|planner      |email                                    |
|Jackson|family member|email                                    |
|Grace  |family member|email (surfaces in Messages via Apple ID)|

### role permissions

|action                          |planner|family member|
|--------------------------------|-------|-------------|
|add / edit / delete meals       |✅      |❌            |
|lock the weekly plan            |✅      |❌            |
|view suggestion inbox           |✅      |✅            |
|mark suggestion as noted / added|✅      |❌            |
|send ad-hoc poll notification   |✅      |❌            |
|vote on meals                   |✅      |✅            |
|submit remix suggestion         |✅      |✅            |
|submit general suggestion       |✅      |✅            |
|+1 an existing suggestion       |✅      |✅            |
|rate last night's dinner        |✅      |✅            |
|claim a task                    |✅      |✅            |

-----

## multi-tenancy

every record in the database belongs to a `household_id`. households are fully isolated — no cross-tenant data access. the app launches as a private household tool with invite-only access. architecture supports opening registration to other families in the future without structural changes.

-----

## screen inventory

### 1. home feed (primary screen)

layout is a vertical scroll in portrait orientation. three sections top to bottom:

**last night strip** (top, collapsible)

- shows after dinner has passed (based on date, not a set time)
- dish name + 1–10 slider with 😬 on the left and 🤩 on the right
- submit rating button
- after rating submitted: collapses to a compact strip showing dish name + score
- persists until rated, then disappears the following day

**tonight hero card** (~70% of visible viewport)

- large display card: dish name, short description, estimated cook time
- task list: cooking dinner / setting the table / clearing up
- each task shows assignee name if claimed, "not claimed yet" if open
- "claim it" button on unclaimed tasks — tapping assigns to current user
- no voting on tonight's card (voting closes at tomorrow state)

**coming up cards** (scrollable below hero)

- one compact card per upcoming dinner (tue–sun or however many are planned)
- each card shows: day, meal name, emoji, running vote tally (😍 / 😐 / 😑)
- tap to expand card
- expanded state shows:
  - three vote buttons: love it / it's fine / rather not (tap again to deselect)
  - remix input field + send button
  - remix is tied to this specific meal as context
- keyboard behavior: footer input only lifts with keyboard when footer field is active; remix field inside card does not trigger footer lift

**suggestion inbox** (below coming up cards)

- visible to all household members
- shows all suggestions: general and remix, from all members
- each entry shows: member name · type (general or remix · meal name) · suggestion text
- +1 button on each suggestion (v2 planned enhancement)
- planners see additional controls: "noted" / "added to rotation" status markers

**footer** (persistent, fixed to bottom)

- label: "suggest a dinner idea"
- single text input + send button
- sends as a general suggestion (no meal context)
- lifts with keyboard only when this field is active

-----

### 2. meal states

each meal moves through a lifecycle:

|state     |condition   |available actions                  |
|----------|------------|-----------------------------------|
|upcoming  |2+ days out |vote, remix, suggest               |
|tomorrow  |next day    |task sign-up only, voting closed   |
|tonight   |current date|task display, claim open tasks     |
|last night|day after   |rating slider shown until submitted|
|archived  |rated       |collapsed, visible in history      |

-----

### 3. planner view additions

planners see everything family members see, plus:

- **add meal button** on the coming up section
- **suggestion inbox controls**: mark as noted / added to rotation
- **ad-hoc poll**: compose a push notification with two options ("pizza or chinese?") sent to all members with a tap-to-vote link

-----

## data model

### households

```
id, name, created_at, invite_code
```

### users

```
id, household_id, name, email, role (planner | member), notification_preference (email), created_at
```

### meals

```
id, household_id, name, description, emoji, scheduled_date, meal_type (dinner | breakfast | lunch), cook_time_minutes, locked (bool), created_by, created_at
```

### tasks

```
id, meal_id, household_id, label, claimed_by (user_id nullable), created_at
```

### votes

```
id, meal_id, user_id, household_id, value (love | meh | nope), created_at
unique constraint: (meal_id, user_id)
```

### ratings

```
id, meal_id, user_id, household_id, score (1–10), created_at
unique constraint: (meal_id, user_id)
```

### suggestions

```
id, meal_id (nullable — null = general), household_id, submitted_by, type (remix | general), text, status (open | noted | added), upvotes (int), created_at
```

### suggestion_upvotes

```
id, suggestion_id, user_id, created_at
unique constraint: (suggestion_id, user_id)
```

### notification_log

```
id, household_id, type (new_meal | rating_reminder | ad_hoc_poll), sent_at, recipient_count
```

-----

## notifications

all notifications sent via **Resend** (email). no SMS.

|trigger               |recipient            |timing           |notes                                                                              |
|----------------------|---------------------|-----------------|-----------------------------------------------------------------------------------|
|new meal added to plan|all household members|immediate        |includes meal name and link to app                                                 |
|rating reminder       |all household members|9:00 PM CT daily |only fires if last night's meal is unrated by that member                          |
|ad-hoc poll           |all household members|planner-triggered|planner writes the question and two options; members tap to vote in email or in app|

### rating reminder cron

- runs nightly at 9:00 PM Central Time (UTC-5 / UTC-6 seasonal)
- checks each household for meals scheduled for yesterday
- checks each member's rating record for that meal
- sends reminder only to members who have not yet submitted a rating
- uses Vercel Cron Jobs (vercel.json schedule config)

-----

## interaction patterns

### voting

- three options: love it (😍) / it's fine (😐) / rather not (😑)
- tap to select, tap again to deselect
- visible to all household members (social visibility reduces duplicate suggestions)
- closes when meal transitions to tomorrow state

### remix suggestion

- text input inside the expanded meal card
- tied to that specific meal as context
- appears in inbox labeled: `[member] · remix · [meal name]`
- send button label: "send"

### general suggestion

- persistent footer input, always accessible
- no meal context
- appears in inbox labeled: `[member] · general`
- send button label: "send"

### task claiming

- tasks are pre-populated by the planner when adding a meal
- default tasks: cooking dinner, setting the table, clearing up
- any member can claim an unclaimed task
- claimed tasks show the member's name
- no unclaiming in v1 (planner can edit)

### rating

- 1–10 slider with emoji anchors
- appears as top strip the morning after a scheduled meal
- collapses to compact scored row after submission
- disappears the following day

-----

## design language

**name**: pickie (lowercase, always)
**wordmark**: plain lowercase text, rounded sans-serif (Nunito or Poppins)
**color palette**: warm coral/orange primary (#D85A30), light coral backgrounds (#FAECE7, #F5C4B3)
**approach**: mobile-first, portrait orientation, agenda/feed layout — no calendar grid
**viewport**: designed for 375px wide (iPhone standard), scales to larger mobile
**typography**: rounded sans-serif, two weights only (400 regular, 500 medium)
**no pickle**: keep palette warm (oranges, corals, ambers) — no green anywhere in the UI

-----

## tech stack

|layer                |tool                |notes                               |
|---------------------|--------------------|------------------------------------|
|frontend             |React + Tailwind CSS|mobile-first, PWA target            |
|backend / database   |Supabase            |auth, row-level security, real-time |
|hosting              |Vercel              |one-command deploy, cron job support|
|email / notifications|Resend              |free tier covers family scale       |
|cron jobs            |Vercel Cron Jobs    |nightly rating reminder at 9 PM CT  |

### supabase notes

- row-level security enforces household isolation (every query scoped by `household_id`)
- auth handles user sessions and role assignment
- real-time subscriptions for live vote/suggestion updates without polling

-----

## v1 scope (build this)

- [x] home feed with all three sections
- [x] meal lifecycle states
- [x] voting (love / meh / nope)
- [x] remix suggestions tied to meal
- [x] general suggestions via footer
- [x] suggestion inbox visible to all
- [x] task claiming
- [x] post-dinner rating slider
- [x] planner: add / edit meals
- [x] planner: suggestion status (noted / added)
- [x] multi-tenant household model
- [x] invite-only household join
- [x] email notifications via Resend
- [x] nightly rating reminder cron (9 PM CT)
- [x] ad-hoc planner poll notification

-----

## planned enhancements (v2+)

- **+1 on suggestions** — upvote existing suggestions instead of re-submitting
- **suggestion-to-meal link** — when a suggestion leads to a meal being added, show the connection so the member who suggested it sees the impact ("Grace suggested this 🎉")
- **meal history / ratings archive** — browse past meals with average scores, filter by rating
- **rotation intelligence** — flag meals that score consistently low; surface high-rated meals for re-scheduling
- **breakfast / lunch planning** — seasonal toggle (summer mode) to extend planning beyond dinner
- **open registration** — allow other families to create households

-----

## open questions for build

1. **invite flow**: email invite link, or a shareable household code the planner reads out?
1. **meal emoji**: planner picks manually, or auto-suggested based on meal name?
1. **task defaults**: same three tasks every meal, or planner customizes per meal?
1. **tomorrow state**: does voting hard-close, or just show a "voting closed" state with results visible?
1. **rating visibility**: does everyone see each other's ratings, or just the aggregate?
1. **PWA vs native**: build as a web PWA first (simplest), or go React Native from the start for better mobile feel?
