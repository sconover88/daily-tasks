import "server-only";
import { db } from "./db";
import type { Completion, DateString, Task } from "./types";
import type { TaskInput } from "./validation";

const TASK_COLUMNS =
  "id, title, notes, category, time_of_day, repeat, weekdays, times_per_week, due_date, completed_at, created_at";

class DataError extends Error {
  constructor(action: string, cause: { message: string; code?: string }) {
    super(`Couldn't ${action}: ${cause.message}`);
    this.name = "DataError";
  }
}

export async function listTasks(): Promise<Task[]> {
  const { data, error } = await db().from("tasks").select(TASK_COLUMNS).order("created_at", { ascending: true });
  if (error) throw new DataError("load tasks", error);
  return (data ?? []) as Task[];
}

/** Unfinished tasks plus one-time tasks finished on `since` or later. */
export async function listOpenAndRecentTasks(since: DateString): Promise<Task[]> {
  const { data, error } = await db()
    .from("tasks")
    .select(TASK_COLUMNS)
    .or(`completed_at.is.null,completed_at.gte.${since}T00:00:00Z`)
    .order("created_at", { ascending: true });
  if (error) throw new DataError("load tasks", error);
  return (data ?? []) as Task[];
}

export async function getTask(id: string): Promise<Task | null> {
  const { data, error } = await db().from("tasks").select(TASK_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw new DataError("load the task", error);
  return (data as Task | null) ?? null;
}

function toRow(input: TaskInput) {
  return {
    title: input.title,
    notes: input.notes,
    category: input.category,
    time_of_day: input.time_of_day,
    repeat: input.repeat,
    weekdays: input.repeat === "weekly" && input.weekdays.length > 0 ? input.weekdays : null,
    times_per_week: input.times_per_week,
    due_date: input.due_date,
  };
}

export async function createTask(input: TaskInput): Promise<Task> {
  const { data, error } = await db().from("tasks").insert(toRow(input)).select(TASK_COLUMNS).single();
  if (error) throw new DataError("save the task", error);
  return data as Task;
}

export async function updateTask(id: string, input: TaskInput): Promise<void> {
  const row: Record<string, unknown> = toRow(input);
  // A task switched to repeating can't stay "finished".
  if (input.repeat !== "none") row.completed_at = null;
  const { error } = await db().from("tasks").update(row).eq("id", id);
  if (error) throw new DataError("update the task", error);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await db().from("tasks").delete().eq("id", id);
  if (error) throw new DataError("delete the task", error);
}

export async function setDueDate(id: string, date: DateString | null): Promise<void> {
  const { error } = await db().from("tasks").update({ due_date: date }).eq("id", id);
  if (error) throw new DataError("move the task", error);
}

/** Mark a task done on `day`. One-time tasks are also marked finished. */
export async function completeTask(id: string, day: DateString): Promise<void> {
  const task = await getTask(id);
  if (!task) throw new Error("That task no longer exists.");

  const { error } = await db()
    .from("completions")
    .upsert({ task_id: id, completed_on: day }, { onConflict: "task_id,completed_on", ignoreDuplicates: true });
  if (error) throw new DataError("check off the task", error);

  if (task.repeat === "none" && !task.completed_at) {
    const { error: finishError } = await db()
      .from("tasks")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", id);
    if (finishError) throw new DataError("check off the task", finishError);
  }
}

/** Undo a check-off on `day`. One-time tasks become unfinished again. */
export async function undoCompletion(id: string, day: DateString): Promise<void> {
  const { error } = await db().from("completions").delete().eq("task_id", id).eq("completed_on", day);
  if (error) throw new DataError("undo the check-off", error);

  const { error: reopenError } = await db()
    .from("tasks")
    .update({ completed_at: null })
    .eq("id", id)
    .eq("repeat", "none");
  if (reopenError) throw new DataError("undo the check-off", reopenError);
}

/** Completion rows on `since` or later (for today's and this week's check-offs). */
export async function listCompletionsFrom(since: DateString): Promise<Completion[]> {
  const { data, error } = await db()
    .from("completions")
    .select("id, task_id, completed_on, completed_at")
    .gte("completed_on", since);
  if (error) throw new DataError("load this week's check-offs", error);
  return (data ?? []) as Completion[];
}

/** Every distinct day something was done, newest first (enough for multi-year streaks). */
export async function listCompletionDates(): Promise<DateString[]> {
  const { data, error } = await db()
    .from("completions")
    .select("completed_on")
    .order("completed_on", { ascending: false })
    .limit(5000);
  if (error) throw new DataError("load your streak", error);
  return [...new Set((data ?? []).map((row) => row.completed_on as DateString))];
}

export type CompletionWithTask = Completion & {
  task: Pick<Task, "id" | "title" | "category" | "repeat" | "time_of_day"> | null;
};

export async function listCompletionsSince(since: DateString): Promise<CompletionWithTask[]> {
  const { data, error } = await db()
    .from("completions")
    .select("id, task_id, completed_on, completed_at, task:tasks(id, title, category, repeat, time_of_day)")
    .gte("completed_on", since)
    .order("completed_on", { ascending: false })
    .order("completed_at", { ascending: false });
  if (error) throw new DataError("load your completed tasks", error);
  return (data ?? []) as unknown as CompletionWithTask[];
}
