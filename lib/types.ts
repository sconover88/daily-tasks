export const TIMES_OF_DAY = ["morning", "afternoon", "evening", "anytime"] as const;
export type TimeOfDay = (typeof TIMES_OF_DAY)[number];

export const REPEATS = ["none", "daily", "weekly"] as const;
export type Repeat = (typeof REPEATS)[number];

/** A calendar date as "YYYY-MM-DD" (no time, no zone). */
export type DateString = string;

/** A row in the `tasks` table. */
export type Task = {
  id: string;
  title: string;
  notes: string | null;
  category: string | null;
  time_of_day: TimeOfDay;
  repeat: Repeat;
  /** 0 = Sunday ... 6 = Saturday. Only used when repeat = "weekly". */
  weekdays: number[] | null;
  /**
   * Weekly tasks with no chosen days: how many times to do it each Mon–Sun week (1–7).
   * Null for every other kind of task.
   */
  times_per_week: number | null;
  /** One-time: when it's due. Repeating: optional start date. */
  due_date: DateString | null;
  /** Set when a one-time task is finished. Repeating tasks never set this. */
  completed_at: string | null;
  created_at: string;
};

/** A row in the `completions` table: "task X was done on day Y". */
export type Completion = {
  id: string;
  task_id: string;
  completed_on: DateString;
  completed_at: string;
};

export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  anytime: "Anytime",
};

export const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const WEEKDAY_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** Weekday order shown in the form: the week starts on Monday, like the streak. */
export const WEEKDAY_FORM_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export const PRESET_CATEGORIES = ["Health", "Chores", "Errands", "Research"] as const;
