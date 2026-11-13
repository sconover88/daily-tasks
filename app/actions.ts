"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getToday } from "@/lib/config";
import * as data from "@/lib/data";
import { parseTaskForm, readTaskForm, type FieldErrors, type TaskFormValues } from "@/lib/validation";

export type SaveTaskState = {
  errors: FieldErrors;
  formError?: string;
  values?: TaskFormValues;
};

export type ActionResult = { ok: true } | { ok: false; error: string };

const idSchema = z.uuid();
const RETURN_PATHS = new Set(["/", "/backlog", "/done"]);

function refresh() {
  revalidatePath("/", "layout");
}

function messageFrom(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Try again.";
}

/** Create a task (no id) or update one (with id), then go back to where you came from. */
export async function saveTask(_prev: SaveTaskState, formData: FormData): Promise<SaveTaskState> {
  const values = readTaskForm(formData);
  const parsed = parseTaskForm(values);
  if (!parsed.ok) return { errors: parsed.errors, values };

  const rawId = formData.get("id");
  const returnTo = String(formData.get("return_to") ?? "");

  try {
    if (typeof rawId === "string" && rawId !== "") {
      const id = idSchema.parse(rawId);
      await data.updateTask(id, parsed.data);
    } else {
      await data.createTask(parsed.data);
    }
  } catch (error) {
    return { errors: {}, formError: messageFrom(error), values };
  }

  refresh();
  redirect(RETURN_PATHS.has(returnTo) ? returnTo : parsed.data.repeat === "none" && !parsed.data.due_date ? "/backlog" : "/");
}

export async function deleteTaskAction(id: string, returnTo: string = "/backlog"): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: "That task couldn't be found." };
  try {
    await data.deleteTask(parsedId.data);
  } catch (error) {
    return { ok: false, error: messageFrom(error) };
  }
  refresh();
  redirect(RETURN_PATHS.has(returnTo) ? returnTo : "/backlog");
}

/** Check a task off for today, or undo today's check-off. */
export async function setTaskDone(id: string, done: boolean): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: "That task couldn't be found." };
  try {
    const today = getToday();
    if (done) await data.completeTask(parsedId.data, today);
    else await data.undoCompletion(parsedId.data, today);
  } catch (error) {
    return { ok: false, error: messageFrom(error) };
  }
  refresh();
  return { ok: true };
}

/** Pull a backlog task onto today's list. */
export async function doToday(id: string): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: "That task couldn't be found." };
  try {
    await data.setDueDate(parsedId.data, getToday());
  } catch (error) {
    return { ok: false, error: messageFrom(error) };
  }
  refresh();
  return { ok: true };
}
