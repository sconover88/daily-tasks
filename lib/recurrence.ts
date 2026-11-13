import { weekdayOf } from "./dates";
import {
  TIMES_OF_DAY,
  WEEKDAY_FORM_ORDER,
  WEEKDAY_SHORT,
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

/** "Daily", "Weekdays", "Mon, Wed, Fri", "One-time". */
export function describeRepeat(task: Pick<Task, "repeat" | "weekdays">): string {
  if (task.repeat === "none") return "One-time";
  if (task.repeat === "daily") return "Daily";
  const days = new Set(task.weekdays ?? []);
  if (days.size === 7) return "Every day";
  if (days.size === 5 && [1, 2, 3, 4, 5].every((d) => days.has(d))) return "Weekdays";
  if (days.size === 2 && days.has(0) && days.has(6)) return "Weekends";
  return WEEKDAY_FORM_ORDER.filter((d) => days.has(d))
    .map((d) => WEEKDAY_SHORT[d])
    .join(", ");
}
