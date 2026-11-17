-- Update 2: weekly tasks with no set days ("do it N times a week, any days").
-- Paste into Supabase > SQL Editor > New query, then press Run.
-- Safe to run more than once. It doesn't change or delete any of your tasks.

alter table public.tasks
  add column if not exists times_per_week smallint
  check (times_per_week is null or times_per_week between 1 and 7);

-- Weekly tasks now need either chosen days OR a times-per-week count.
alter table public.tasks drop constraint if exists weekly_needs_days;
alter table public.tasks add constraint weekly_needs_days check (
  repeat <> 'weekly'
  or (weekdays is not null and cardinality(weekdays) > 0)
  or times_per_week is not null
);
