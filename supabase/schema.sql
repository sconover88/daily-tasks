-- Daily Tasks database schema.
-- Paste this whole file into Supabase > SQL Editor > New query, then press Run.
-- It's safe to run more than once.

create extension if not exists pgcrypto;

-- Everything you want to do: one-time to-dos and repeating routines.
create table if not exists public.tasks (
  id            uuid primary key default gen_random_uuid(),
  title         text not null check (char_length(btrim(title)) between 1 and 200),
  notes         text check (notes is null or char_length(notes) <= 2000),
  category      text check (category is null or char_length(category) between 1 and 40),
  time_of_day   text not null default 'anytime'
                check (time_of_day in ('morning', 'afternoon', 'evening', 'anytime')),
  repeat        text not null default 'none'
                check (repeat in ('none', 'daily', 'weekly')),
  -- 0 = Sunday ... 6 = Saturday. Required (non-empty) for weekly tasks.
  weekdays      smallint[]
                check (weekdays is null or weekdays <@ array[0,1,2,3,4,5,6]::smallint[]),
  -- One-time: the due date. Repeating: an optional start date.
  due_date      date,
  -- Set when a one-time task is finished. Repeating tasks leave this empty.
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  constraint weekly_needs_days check (
    repeat <> 'weekly' or (weekdays is not null and cardinality(weekdays) > 0)
  ),
  constraint only_one_time_tasks_finish check (repeat = 'none' or completed_at is null)
);

-- One row per task per day it was done. Drives the streak and the Done tab.
create table if not exists public.completions (
  id            uuid primary key default gen_random_uuid(),
  task_id       uuid not null references public.tasks (id) on delete cascade,
  completed_on  date not null,
  completed_at  timestamptz not null default now(),
  constraint one_completion_per_day unique (task_id, completed_on)
);

create index if not exists completions_completed_on_idx on public.completions (completed_on desc);
create index if not exists tasks_open_idx on public.tasks (repeat, completed_at);

-- Lock the tables. Row Level Security on with NO policies means the public
-- (anon / publishable) key can't read or write anything. Only the app's
-- server, using the secret key, can.
alter table public.tasks enable row level security;
alter table public.completions enable row level security;

revoke all on public.tasks from anon, authenticated;
revoke all on public.completions from anon, authenticated;
