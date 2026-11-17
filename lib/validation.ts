import { z } from "zod";
import { isDateString } from "./dates";
import { REPEATS, TIMES_OF_DAY } from "./types";

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} can be at most ${max} characters.`)
    .transform((v) => (v === "" ? null : v));

export const taskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Give the task a name.")
      .max(200, "Keep the name under 200 characters."),
    notes: optionalText(2000, "Notes"),
    category: optionalText(40, "Category"),
    time_of_day: z.enum(TIMES_OF_DAY, { error: "Pick a time of day." }),
    repeat: z.enum(REPEATS, { error: "Pick how often it repeats." }),
    weekdays: z.array(z.coerce.number().int().min(0).max(6)).transform((days) => [...new Set(days)].sort()),
    // Only for weekly tasks with no chosen days; null otherwise.
    times_per_week: z.union([
      z.null(),
      z.coerce
        .number({ error: "Pick how many times a week." })
        .int("Pick how many times a week.")
        .min(1, "Pick how many times a week.")
        .max(7, "Pick how many times a week."),
    ], { error: "Pick how many times a week." }),
    due_date: z
      .string()
      .trim()
      .refine((v) => v === "" || isDateString(v), "Pick a valid date.")
      .transform((v) => (v === "" ? null : v)),
  });

export type TaskInput = z.infer<typeof taskSchema>;
export type TaskField =
  | "title"
  | "notes"
  | "category"
  | "time_of_day"
  | "repeat"
  | "weekdays"
  | "times_per_week"
  | "due_date";
export type FieldErrors = Partial<Record<TaskField, string>>;

/** Raw form values, kept so the form can be refilled after an error. */
export type TaskFormValues = {
  title: string;
  notes: string;
  categoryChoice: string;
  categoryCustom: string;
  time_of_day: string;
  repeat: string;
  weekdays: string[];
  times_per_week: string;
  due_date: string;
};

export function readTaskForm(formData: FormData): TaskFormValues {
  const str = (key: string) => {
    const v = formData.get(key);
    return typeof v === "string" ? v : "";
  };
  return {
    title: str("title"),
    notes: str("notes"),
    categoryChoice: str("category"),
    categoryCustom: str("category_custom"),
    time_of_day: str("time_of_day") || "anytime",
    repeat: str("repeat") || "none",
    weekdays: formData.getAll("weekdays").filter((v): v is string => typeof v === "string"),
    times_per_week: str("times_per_week"),
    due_date: str("due_date"),
  };
}

export type ParseResult = { ok: true; data: TaskInput } | { ok: false; errors: FieldErrors };

export function parseTaskForm(values: TaskFormValues): ParseResult {
  const category = values.categoryChoice === "custom" ? values.categoryCustom : values.categoryChoice;
  const weekly = values.repeat === "weekly";
  // Weekly with no days picked means "N times a week, any days".
  const flexible = weekly && values.weekdays.length === 0;
  const result = taskSchema.safeParse({
    title: values.title,
    notes: values.notes,
    category,
    time_of_day: values.time_of_day,
    repeat: values.repeat,
    weekdays: weekly ? values.weekdays : [],
    times_per_week: flexible ? values.times_per_week.trim() : null,
    due_date: values.due_date,
  });
  const errors: FieldErrors = {};
  if (values.categoryChoice === "custom" && !values.categoryCustom.trim()) {
    errors.category = "Type a category name, or pick one above.";
  }
  if (result.success && Object.keys(errors).length === 0) return { ok: true, data: result.data };

  for (const issue of result.success ? [] : result.error.issues) {
    const field = issue.path[0] as TaskField | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return { ok: false, errors };
}
