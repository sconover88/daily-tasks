import { weekdayOf, weekStart } from "./dates";
import {
  TIMES_OF_DAY,
  WEEKDAY_FORM_ORDER,
  WEEKDAY_SHORT,
  type Completion,
  type DateString,
  type Task,
  type TimeOfDay,
} from "./types";

type Schedulable = Pick<Task, "repeat" | "weekdays" | "due_date" | "completed_at">;

/**
 * Is this task on the list for `date`?
 *
 * - One-time: due when it has a date on or before `date` and isn't finished.
 *   Undated one-time tasks live in the backlog until you pick "Do today".
 * - Daily: every day (from its start date, if it has one).
 * - Weekly: on its chosen weekdays (from its start date, if it has one).
 * - Weekly with no chosen days: never on a specific day's list. Those live in
 *   the "This week" section instead (see buildWeeklyItems).
 *
 * Repeating tasks reset on schedule: missed days never pile up.
 */
export function isDueOn(task: Schedulable, date: DateString): boolean {
  if (task.repeat === "none") {
    if (task.completed_at) return false;
    return task.due_date !== null && task.due_date <= date;
  }
  if (task.due_date && date < task.due_date) return false;
  if (task.repeat === "daily") return true;
  return (task.weekdays ?? []).includes(weekdayOf(date));
}

/** A one-time task whose date has already passed. */
export function isOverdue(task: Schedulable, date: DateString): boolean {
  return task.repeat === "none" && !task.completed_at && task.due_date !== null && task.due_date < date;
}

export type TodayItem = {
  task: Task;
  done: boolean;
  overdue: boolean;
};

/**
 * Everything that belongs on today's list, including things already
 * checked off today so they can be undone.
 *
 * @param doneTodayIds task ids with a completion row for `today`
 */
export function buildTodayItems(tasks: Task[], doneTodayIds: Set<string>, today: DateString): TodayItem[] {
  const items: TodayItem[] = [];
  for (const task of tasks) {
    const doneToday = doneTodayIds.has(task.id);
    if (task.repeat === "none") {
      if (task.completed_at) {
        if (doneToday) items.push({ task, done: true, overdue: false });
        continue;
      }
      if (isDueOn(task, today)) items.push({ task, done: false, overdue: isOverdue(task, today) });
      continue;
    }
    if (isDueOn(task, today)) items.push({ task, done: doneToday, overdue: false });
  }
  return items;
}

/** A weekly task with no set days: do it N times each week, any days. */
export function isFlexibleWeekly(task: Pick<Task, "repeat" | "weekdays">): boolean {
  return task.repeat === "weekly" && (task.weekdays ?? []).length === 0;
}

export type WeeklyItem = {
  task: Task;
  /** Days this Mon–Sun week it's been checked off (today included). */
  count: number;
  /** How many times a week it should be done. */
  target: number;
  doneToday: boolean;
  /** Reached the target for this week. */
  complete: boolean;
};

/**
 * The "This week" section: flexible weekly tasks with this week's progress.
 * The count resets every Monday, and missed weeks don't carry over.
 *
 * @param completions completion rows from at least this week's Monday onward
 */
export function buildWeeklyItems(
  tasks: Task[],
  completions: Pick<Completion, "task_id" | "completed_on">[],
  today: DateString,
): WeeklyItem[] {
  const monday = weekStart(today);
  const counts = new Map<string, number>();
  const doneToday = new Set<string>();
  for (const c of completions) {
    if (c.completed_on < monday || c.completed_on > today) continue;
    counts.set(c.task_id, (counts.get(c.task_id) ?? 0) + 1);
    if (c.completed_on === today) doneToday.add(c.task_id);
  }

  return tasks
    .filter((task) => isFlexibleWeekly(task) && !(task.due_date && task.due_date > today))
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((task) => {
      const count = counts.get(task.id) ?? 0;
      const target = task.times_per_week ?? 1;
      return { task, count, target, doneToday: doneToday.has(task.id), complete: count >= target };
    });
}

export type TodayGroup = { timeOfDay: TimeOfDay; items: TodayItem[] };

/** Morning, Afternoon, Evening, Anytime; empty groups dropped. Overdue first, then oldest. */
export function groupByTimeOfDay(items: TodayItem[]): TodayGroup[] {
  return TIMES_OF_DAY.map((timeOfDay) => ({
    timeOfDay,
    items: items
      .filter((item) => item.task.time_of_day === timeOfDay)
      .sort((a, b) => {
        if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
        return a.task.created_at.localeCompare(b.task.created_at);
      }),
  })).filter((group) => group.items.length > 0);
}

/** Backlog: unfinished one-time tasks with no date or a future date. */
export function backlogTasks(tasks: Task[], today: DateString): Task[] {
  return tasks
    .filter((t) => t.repeat === "none" && !t.completed_at && (t.due_date === null || t.due_date > today))
    .sort((a, b) => {
      // Dated ones first (soonest first), then undated by newest.
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return b.created_at.localeCompare(a.created_at);
    });
}

export function repeatingTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.repeat !== "none").sort((a, b) => a.title.localeCompare(b.title));
}

/** "Once a week", "Twice a week", "3 times a week". */
export function describeTimesPerWeek(times: number): string {
  if (times === 1) return "Once a week";
  if (times === 2) return "Twice a week";
  return `${times} times a week`;
}

/** "Daily", "Weekdays", "Mon, Wed, Fri", "Twice a week", "One-time". */
export function describeRepeat(
  task: Pick<Task, "repeat" | "weekdays"> & { times_per_week?: number | null },
): string {
  if (task.repeat === "none") return "One-time";
  if (task.repeat === "daily") return "Daily";
  const days = new Set(task.weekdays ?? []);
  if (days.size === 0) return describeTimesPerWeek(task.times_per_week ?? 1);
  if (days.size === 7) return "Every day";
  if (days.size === 5 && [1, 2, 3, 4, 5].every((d) => days.has(d))) return "Weekdays";
  if (days.size === 2 && days.has(0) && days.has(6)) return "Weekends";
  return WEEKDAY_FORM_ORDER.filter((d) => days.has(d))
    .map((d) => WEEKDAY_SHORT[d])
    .join(", ");
}
