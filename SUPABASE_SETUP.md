# Supabase setup (about 10 minutes, no command line)

Supabase holds your tasks. You'll create a free project, paste in one block of SQL, and copy two values.

## 1. Create the project

1. Go to <https://supabase.com> and click **Start your project**. Sign in with GitHub (easiest) or email.
2. If asked to create an organization, name it anything (for example, your name) and choose the **Free** plan.
3. Click **New project**.
4. Fill in:
   - **Project name:** `daily-tasks`
   - **Database password:** click **Generate a password**, then save it in your password manager. The app doesn't need it, but you'd need it to manage the database later.
   - **Region:** pick the one closest to you. For Mountain time, **West US (Oregon)** or **Central US** are good.
5. Click **Create new project**, then wait 1–2 minutes until the dashboard finishes setting up.

## 2. Create the tables

1. In the left sidebar, click **SQL Editor** (the icon looks like `>_`).
2. Click **New query** (or the **+** button).
3. Open the file `supabase/schema.sql` from this project, select everything in it, and copy it.
   - On GitHub: open the file, then click the **Copy raw file** button (two overlapping squares).
4. Paste it into the big editor box in Supabase.
5. Click **Run** (bottom right), or press Cmd+Enter.
6. You should see **"Success. No rows returned."**
   - If Supabase warns that the query has "destructive operations", that's the `revoke` lines that lock the tables to the public. Click **Run this query** to confirm.
7. Check it worked: click **Table Editor** in the left sidebar. You should see two tables, **tasks** and **completions**.

It's safe to run the SQL again if you're unsure. It won't delete anything.

## 3. Copy your two keys

1. Click the **gear icon (Project Settings)** at the bottom of the left sidebar.
2. **Project URL:** click **Data API** (in some versions this is **API**). Copy the **Project URL**. It looks like `https://abcdefghijklmnop.supabase.co`.
3. **Secret key:** click **API Keys**.
   - Under **Secret keys**, copy the key that starts with `sb_secret_`. Click the eye icon or **Reveal** first. If none exists, click **Add new secret key**.
   - If you only see a **Legacy API keys** tab, use the **service_role** key there (not the `anon` one).

Keep the secret key private, like a password. Anyone with it can read and change your tasks. Don't paste it into chat, email or screenshots.

## 4. Give the keys to the app

### On Vercel (for your phone)

You'll add the keys when you import the project. See "Deploy to Vercel" in the README. They go in the **Environment Variables** section:

| Name | Value |
|---|---|
| `SUPABASE_URL` | your Project URL |
| `SUPABASE_SECRET_KEY` | your secret key |
| `APP_TIME_ZONE` | `America/Denver` (use `America/Phoenix` in Arizona) |

### On your computer (optional, only to run it locally)

1. In the project folder, make a copy of the file `.env.example` and name the copy `.env.local`.
   - In Kiro or VS Code: right-click `.env.example`, then **Copy**, then **Paste**, then rename the copy to `.env.local`.
2. Open `.env.local` and replace the placeholder values:

   ```
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_SECRET_KEY=sb_secret_your-key-here
   APP_TIME_ZONE=America/Denver
   ```

3. Save. `.env.local` is in `.gitignore`, so it never goes to GitHub.

## Database updates

When a new feature needs a database change, it comes as a file in `supabase/migrations/`. Run each one once, in number order, the same way you ran the schema:

1. Open Supabase, click **SQL Editor**, then **New query**.
2. Copy the whole migration file and paste it in.
3. Click **Run**. You should see **"Success. No rows returned."**

| File | Adds |
|---|---|
| `002_flexible_weekly.sql` | Weekly tasks with no set days ("N times a week") |

Each one is safe to run twice and doesn't delete any tasks. If you're setting up a brand-new project, `schema.sql` already includes them, so you can skip this section.

## Why it's set up this way

- Your phone never talks to Supabase directly. It talks to the app on Vercel, and only the app's server uses the secret key.
- The SQL turns on **Row Level Security** with no rules. That means Supabase's public ("anon" or "publishable") key can't read or write your tasks, even if someone has it.
- The app has no login, so anyone who finds the app's URL can use it. Don't share the link. It's hidden from search engines.

## Troubleshooting

- **The app says "Almost ready":** the keys are missing. On Vercel, check the names are spelled exactly as above, then go to **Deployments** and use **Redeploy** on the latest deployment (environment changes only apply after a redeploy).
- **"Something went wrong":** usually a wrong key or URL. Copy them again. Make sure you used the secret / service_role key, not the anon / publishable one.
- **The free project is paused:** Supabase pauses free projects after about a week of no use. Open the Supabase dashboard and click **Restore project**. Using the app daily keeps it awake.
