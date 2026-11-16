# Daily Tasks: product brief

## Problem

I want one place on my phone for everything I need to do. That covers daily routines (take medicine), weekly chores (laundry, trash) and one-off to-dos (make a return). I add things to a backlog whenever I think of them. My goal is to **finish at least one task every day**, and a streak keeps me honest.

## User

Just me, one person, almost always on my phone. There are no accounts and no sharing.

## Features

1. **Today tab.** Tasks due today, grouped Morning, Afternoon, Evening and Anytime. Big tap-to-check circles, with undo. Overdue one-time tasks appear here, flagged.
2. **Streak.** A big number at the top of Today, with a "Done today" status once one task is done, and whether this week's free skip is used.
3. **Backlog tab.** One-time tasks with no date or a future date. Each has "Do today" (moves it onto today's list) and a check-off. Repeating tasks are listed below for editing.
4. **Done tab.** Check-offs from the last 30 days, grouped by day (Today, Yesterday, then dates). Today's can be undone.
5. **Add and edit tasks.** Name (required), repeats (one-time, daily, weekly on chosen days), due date (one-time) or start date (repeating), time of day, category (none, Health, Chores, Errands or custom) and notes. Delete with a confirm step.
6. **Home screen install.** Web app manifest and icon.

## Rules

- **Repeating tasks reset on schedule.** A daily task is due every day, and a weekly task on its chosen weekdays. Missed occurrences never pile up.
- **One-time tasks** with a date are due on and after that date (overdue after). Undated ones stay in the backlog. Finishing one removes it from the lists.
- **Streak (forgiving).** A day counts if at least one task was completed. Each Monday–Sunday week allows one missed day, and a second miss in the same week resets the streak to 0. Today doesn't break the streak until it ends. Skipped days don't add to the count.
- **Time zone.** "Today" is computed on the server in `APP_TIME_ZONE` (default `America/Denver`, or `America/Phoenix` for Arizona).
- **Privacy.** No login. The site is noindex (meta tag, `X-Robots-Tag` header, `robots.txt` disallow). The README states that anyone with the URL can use it.

## Design

The look is recorded in `DESIGN.md`: one light background, inset cards on a light grey surface, no dividers, pill buttons and controls, Host Grotesk for display, and Instrument Sans for body text. Blue is used only for status. The design is mobile first, with WCAG AA contrast, visible focus and 44px tap targets.

## Stack

- Next.js (App Router, TypeScript), Tailwind CSS and Vitest.
- Supabase Postgres, accessed only from the server with the secret key. Row Level Security is on with no policies.
- Vercel hosting. GitHub repo `sconover88/daily-tasks`.

## Data model

- `tasks`: id, title, notes, category, time_of_day (morning, afternoon, evening, anytime), repeat (none, daily, weekly), weekdays smallint[] (0 = Sun), due_date, completed_at (one-time only) and created_at.
- `completions`: id, task_id (cascade delete), completed_on (date), completed_at. Unique per (task_id, completed_on).

---

## Paste-ready prompt (to rebuild this app from scratch)

Copy everything in the box below into an AI coding assistant, in an empty folder.

```text
Build a personal, single-user, mobile-first daily task web app called "Daily Tasks".
Stack: Next.js (App Router, TypeScript), Tailwind CSS, Supabase (Postgres) for data,
deployed on Vercel. Pin dependency versions exactly. I'm not comfortable with the
command line: any step I must do myself needs explicit, click-by-click instructions
with the exact text to paste.

GOAL
One place on my phone for daily routines (take medicine), weekly chores (laundry,
trash) and one-off to-dos (make a return). I add to a backlog anytime. My goal is
to complete at least one task per day, tracked by a streak.

FEATURES
1. Today tab (home): tasks due today grouped Morning / Afternoon / Evening / Anytime
   (skip empty groups). Each task is an inset card with a 44px round checkbox
   (role="checkbox", aria-checked, labelled by the title) to complete or undo for today,
   using optimistic UI with an inline error if saving fails. Show category and repeat
   as small tags, and flag overdue one-time tasks ("Overdue since Nov 10") in an
   accessible red. Include tasks already checked off today so they can be undone.
2. Streak panel at the top of Today: the streak number at display size (60px), a
   "Done today" status badge (the accent blue) once any task is done today, a short
   encouraging message, and "Free skip this week: available/used" (hidden when the
   streak is 0).
3. Backlog tab: unfinished one-time tasks with no date or a future date (dated
   soonest first, then undated newest first). Each has a "Do today" button (sets the
   due date to today) and a checkbox. Below that, a "Repeating" list of all
   daily/weekly tasks with their schedule, for editing.
4. Done tab: completions from the last 30 days grouped by day ("Today", "Yesterday",
   then "Nov 1"), with the time and category; "Undo" on today's items; a summary line
   ("12 tasks done on 9 of the last 30 days").
5. Add/Edit task form (/tasks/new, /tasks/[id]): Task name (required, max 200);
   Repeats (One-time / Daily / Weekly segmented pills); weekday pills Mon..Sun when
   Weekly (at least one required); a date field labelled "Due date" for one-time
   (empty = backlog) or "Starts on" for repeating, with Today / Tomorrow / Clear
   shortcuts; Time of day pills (Morning, Afternoon, Evening, Anytime; default
   Anytime); Category pills (None, Health, Chores, Errands, Other + text field, max 40);
   Notes (max 2000). Visible labels, server-side validation with zod, inline errors
   with aria-invalid, an error summary, and focus moves to the first invalid field.
   Don't let React reset the form after a failed submit. Delete with an in-page
   two-step confirm (no browser pop-up).
6. Bottom navigation fixed in thumb reach: a surface pill with Today / Backlog / Done
   (active tab filled, aria-current="page") plus a round "+" Add task button.
   Respect the iPhone safe area.
7. Web app manifest + PNG icons (generated with next/og: a white check on #542177)
   so it can be added to the home screen. Apple touch icon. No service worker.

RULES
- Repeating tasks reset ON SCHEDULE: daily = every day; weekly = on chosen weekdays
  (0=Sun..6=Sat); an optional start date delays the first day. Missed days never
  pile up. Completing a repeating task inserts a completion for today only.
- One-time tasks: due on/after their due date (overdue after), undated = backlog.
  Completing one sets completed_at and inserts a completion for today; undo deletes
  today's completion and clears completed_at.
- Streak (forgiving): a day counts if >=1 completion that day. One free missed day per
  Monday-Sunday week; a second miss in the same week ends the streak. Today doesn't
  count against it until it's over (start counting from yesterday if today isn't
  done). Skipped days don't add. "Skip used this week" = any day from this Monday to
  yesterday had nothing done.
- Dates: compute "today" on the server in env APP_TIME_ZONE (default
  "America/Denver"; "America/Phoenix" for Arizona) with Intl.DateTimeFormat. Do day
  math on YYYY-MM-DD strings as UTC dates so DST never breaks it.
- Put all date, recurrence and streak logic in pure functions with Vitest tests:
  midnight boundary across zones, DST, weekly days, overdue, Monday week boundary,
  one miss vs two misses in a week, misses in different weeks, today not done,
  no history. Also test the form validation and the Today/streak components.

DATA AND SECURITY
- Supabase tables (provide supabase/schema.sql, safe to re-run):
  tasks(id uuid pk default gen_random_uuid(), title text not null check 1-200 chars,
  notes text <=2000, category text 1-40, time_of_day text default 'anytime' check in
  (morning, afternoon, evening, anytime), repeat text default 'none' check in (none,
  daily, weekly), weekdays smallint[] subset of 0..6 and non-empty when weekly,
  due_date date, completed_at timestamptz (only when repeat='none'), created_at
  timestamptz default now());
  completions(id uuid pk, task_id uuid references tasks on delete cascade,
  completed_on date not null, completed_at timestamptz default now(),
  unique(task_id, completed_on)); index on completions(completed_on desc).
- Enable Row Level Security on both tables with NO policies and revoke anon /
  authenticated access, so the public key can't touch data.
- All data access is server-side only (Server Components for reads, Server Actions
  for writes, then revalidatePath). The Supabase client lives in a module that imports
  "server-only" and uses env SUPABASE_URL and SUPABASE_SECRET_KEY (never NEXT_PUBLIC_).
  Validate ids as UUIDs in every action. Only redirect to known in-app paths.
- Render pages dynamically (await connection()). If the env vars are missing, show a
  friendly "Almost ready" setup screen instead of crashing. Add loading, error and
  not-found states, and an empty state for every list.
- No login (single user, by choice). Add noindex robots metadata, an X-Robots-Tag
  header in next.config, and robots.txt that disallows everything. The README must say
  clearly that anyone with the URL can view and edit.
- Provide .env.example; keep .env.local in .gitignore.

DESIGN
Create DESIGN.md at the project root recording these exact specs, then the app rules
below. Implement the tokens as CSS variables mapped into Tailwind's @theme.
- Colour. Background: #fcfcfd; Brand colour: #2563eb; Button colour: #542177; Brand
  colour use: None; Where colour appears: Status only (keep images neutral; use colour
  only for status, such as success or error).
- Type. Two sans-serif fonts: Host Grotesk for display, Instrument Sans for body;
  Headline size: 5.0 x body; Headline emphasis: None.
- Shape. Corners: Round; Button shape: Pill.
- Layout. Page width: Regular; Section spacing: Regular; Section backgrounds: One
  background; Dividers: None; Cards: Inset.
- Imagery. UI only (no photography); framed.
- Starting values: page ground #fcfcfd; alternate ground #f4f3f4; primary text
  #141314; secondary text #454545; muted text #5c5c5c; inverse ground #141314; inverse
  text #fcfcfd; accent #2563eb; primary action fill #542177; primary action label
  #fcfcfd; surface #f4f3f4; hairline #dddddd; display type at 1440px: 80px; display
  type at 390px: 60px; body type 16px; display weight 500; container width 1200px;
  page margin 24px; band padding at 1440px top 96px / bottom 64px; band padding at
  390px top 64px / bottom 48px; surface corner 16px; control corner 9999px. Every text
  pairing among them clears WCAG AA and APCA Lc 75; keep that true.
App rules:
- One background everywhere; cards inset on the surface with 16px corners; no
  dividers (separate with space and surfaces); every control is a pill or circle.
- Primary action = #542177 fill with a #fcfcfd label (main buttons, add button, active
  tab, selected pills, checked boxes). The accent blue is ONLY for the "Done today"
  status. Errors use an accessible red, #991b1b.
- Inputs and unselected pills need a 3:1 outline: add a "control edge" token
  #858585 (the hairline is too faint for controls).
- Fonts via next/font/google: Host_Grotesk 500 for display (titles 32px, section
  headings 20px, the 60px streak number with tabular figures), Instrument_Sans
  400/500/600 for everything else (16px body, 14px small, 13px labels).
- Single column, max ~576px wide, 24px side margins, tighter app rhythm than the
  marketing band padding (document this adaptation in DESIGN.md).
- Pill toggles are real radio/checkbox inputs (visually hidden) with styled labels.
  One focus treatment everywhere: a 2px ink outline, 3px offset, drawn on the pill
  when its hidden input is focused. 44px minimum tap targets. Selection and caret
  use ink. Respect prefers-reduced-motion. The native date input is allowed (best
  picker on phones) but styled as a pill input; note this in DESIGN.md.
- Add `npm run contrast` (a small Node script) that measures every rendered text and
  control pairing with WCAG 2 ratio and APCA Lc reported separately, and record the
  results table in DESIGN.md.

DOCS
- README.md: what it is; a privacy warning; the time zone setting; Vercel
  click-by-click deploy (Add New, Project, Import repo, add SUPABASE_URL,
  SUPABASE_SECRET_KEY and APP_TIME_ZONE, Deploy, how to redeploy after env changes);
  Add to Home Screen on iPhone and Android; optional local run steps; project layout.
- SUPABASE_SETUP.md: click-by-click for a non-technical person: sign up, New project
  (name, generated password, nearby region), SQL Editor, New query, paste
  supabase/schema.sql, Run, verify the tables in Table Editor; Project Settings for
  the Project URL (Data API) and secret key (API Keys, sb_secret_..., or the legacy
  service_role key); where to put them on Vercel and in .env.local; why it's secure;
  troubleshooting (missing keys, wrong key type, free project paused).
- Before finishing, run lint, typecheck, tests and `npm run build` until all pass.
```
