# Daily Tasks

A personal, phone-first task list. It keeps daily routines (take medicine), weekly chores (laundry, trash) and one-off to-dos (make a return) in one place. The goal: **finish at least one task every day.**

Built with Next.js, Supabase and Vercel.

## What it does

- **Today:** what's due today, grouped into Morning, Afternoon, Evening and Anytime. Tap the circle to check a task off, and tap again to undo. Overdue one-time tasks show up here too.
- **Streak:** days in a row with at least one task done. You get **one free missed day per week** (Monday to Sunday), and a second miss in the same week resets it to 0. Today never counts against you until it's over. A blue **Done today** badge appears once you've hit the goal.
- **Backlog:** one-time tasks with no date or a future date. Tap **Do today** to pull one onto today's list. Your repeating tasks are listed here too so you can edit them.
- **Done:** everything you've checked off in the last 30 days, grouped by day. Today's check-offs can be undone.
- **Tasks** have a name, how often they repeat (one-time, daily, or weekly on chosen days), an optional due or start date, time of day, an optional category (Health, Chores, Errands or your own) and notes.
- **Repeating tasks reset on schedule.** A daily task is fresh every morning, and missed days don't pile up.

## Privacy: please read

There's **no login**. Anyone who knows the app's web address can see and change your tasks.

- The app tells search engines not to list it (a `noindex` tag, a header and `robots.txt`), so the URL only spreads if you share it.
- The database itself is locked. Only the app's server can reach it, using a secret key that never goes to the browser.
- Don't put anything very sensitive in task names or notes. If you want a password later, it can be added.

## Time zone

"Today" rolls over at midnight in the zone set by `APP_TIME_ZONE`:

- `America/Denver`: Mountain time with daylight saving (the default)
- `America/Phoenix`: Arizona, Mountain Standard Time all year

Vercel's servers run on UTC, so this setting matters. Without it, your day would end at 5pm or 6pm.

## Set up

1. **Database:** follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md) (about 10 minutes, no command line).
2. **Code on GitHub:** this repository, `sconover88/daily-tasks`.
3. **Deploy:** see below.

## Deploy to Vercel

1. Go to <https://vercel.com> and sign in with GitHub.
2. Click **Add New…**, then **Project**.
3. Find **daily-tasks** in the list and click **Import**. If it's not listed, click **Adjust GitHub App Permissions** and give Vercel access to the repo.
4. Leave **Framework Preset** as **Next.js** and leave the build settings alone.
5. Open **Environment Variables** and add these three. Type each name exactly, paste the value, then click **Add**:

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | your Supabase Project URL |
   | `SUPABASE_SECRET_KEY` | your Supabase secret key |
   | `APP_TIME_ZONE` | `America/Denver` |

6. Click **Deploy** and wait about a minute.
7. Click the preview image or **Visit** to open your app. Bookmark the address, which looks like `daily-tasks-xyz.vercel.app`.

Every time new code is pushed to GitHub, Vercel redeploys automatically. If you change an environment variable later, go to **Deployments**, open the **⋯** menu on the latest one, and choose **Redeploy**.

## Add it to your phone's home screen

- **iPhone (Safari):** open the app, tap the **Share** button (square with an arrow), then **Add to Home Screen**, then **Add**.
- **Android (Chrome):** open the app, tap the **⋮** menu, then **Add to Home screen** (or **Install app**).

It then opens full-screen like a regular app.

## Run it on your computer (optional)

You only need this if you want to change the code. You'll need [Node.js](https://nodejs.org) 20.9 or newer (choose the **LTS** download).

1. Create `.env.local` as described in SUPABASE_SETUP.md, step 4.
2. Open the project folder in Kiro or VS Code, then open a terminal: **Terminal**, then **New Terminal**.
3. Run these one at a time:

   ```
   npm install
   npm run dev
   ```

4. Open <http://localhost:3000>. To see the phone layout in Chrome, press Cmd+Option+I, then click the phone icon.
5. Press Ctrl+C in the terminal to stop it.

Other commands:

| Command | What it does |
|---|---|
| `npm test` | runs the tests (dates, repeats, streak, form validation, screens) |
| `npm run lint` | checks code style |
| `npm run typecheck` | checks types |
| `npm run build` | makes a production build, the same as Vercel does |
| `npm run contrast` | measures colour contrast (WCAG 2 and APCA) |

## Project layout

```
app/                 pages: Today (page.tsx), backlog/, done/, tasks/new, tasks/[id]
app/actions.ts       server actions: save, delete, check off, undo, do today
components/          UI pieces (TaskRow, TaskForm, StreakPanel, TabBar…)
lib/dates.ts         time-zone-safe dates
lib/recurrence.ts    what's due when
lib/streak.ts        the forgiving streak
lib/data.ts          database reads and writes (server only)
lib/validation.ts    form rules
supabase/schema.sql  database tables
DESIGN.md            the design contract: colours, type, shape, rules, contrast
brief.md             product brief + a prompt to rebuild the app from scratch
```
