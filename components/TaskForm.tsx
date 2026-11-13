"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { saveTask, type SaveTaskState } from "@/app/actions";
import { addDays } from "@/lib/dates";
import {
  PRESET_CATEGORIES,
  TIMES_OF_DAY,
  TIME_OF_DAY_LABELS,
  WEEKDAY_FORM_ORDER,
  WEEKDAY_LONG,
  WEEKDAY_SHORT,
  type DateString,
  type Repeat,
  type Task,
} from "@/lib/types";
import type { TaskField } from "@/lib/validation";
import PillOption from "./PillOption";

type Props = {
  task?: Task;
  today: DateString;
  returnTo: string;
  cancelHref: string;
};

const REPEAT_OPTIONS: { value: Repeat; label: string }[] = [
  { value: "none", label: "One-time" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

const FIELD_ORDER: TaskField[] = ["title", "repeat", "weekdays", "due_date", "time_of_day", "category", "notes"];

const inputClass =
  "block w-full rounded-control border border-edge bg-ground px-4 text-body text-ink placeholder:text-ink-muted aria-[invalid=true]:border-danger";

function initialCategory(task?: Task) {
  if (!task?.category) return { choice: "", custom: "" };
  if ((PRESET_CATEGORIES as readonly string[]).includes(task.category)) return { choice: task.category, custom: "" };
  return { choice: "custom", custom: task.category };
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-small font-medium text-danger">
      {message}
    </p>
  );
}

export default function TaskForm({ task, today, returnTo, cancelHref }: Props) {
  const [state, formAction] = useActionState<SaveTaskState, FormData>(saveTask, { errors: {} });
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const category = initialCategory(task);
  const [title, setTitle] = useState(task?.title ?? "");
  const [repeat, setRepeat] = useState<Repeat>(task?.repeat ?? "none");
  const [weekdays, setWeekdays] = useState<number[]>(task?.weekdays ?? []);
  const [dueDate, setDueDate] = useState(task?.due_date ?? "");
  const [timeOfDay, setTimeOfDay] = useState<string>(task?.time_of_day ?? "anytime");
  const [categoryChoice, setCategoryChoice] = useState(category.choice);
  const [categoryCustom, setCategoryCustom] = useState(category.custom);
  const [notes, setNotes] = useState(task?.notes ?? "");

  const errors = state.errors;

  // After a failed save, move focus to the first field with a problem.
  useEffect(() => {
    const first = FIELD_ORDER.find((f) => errors[f]);
    if (!first || !formRef.current) return;
    const target = formRef.current.querySelector<HTMLElement>(`[data-field="${first}"]`);
    const control = target?.matches("input, textarea") ? target : target?.querySelector<HTMLElement>("input");
    (control ?? target)?.focus();
  }, [errors]);

  function toggleWeekday(day: number, on: boolean) {
    setWeekdays((current) => (on ? [...new Set([...current, day])] : current.filter((d) => d !== day)));
  }

  const isNew = !task;
  const errorCount = Object.keys(errors).length;

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(event) => {
        // Submit through a transition so React doesn't reset the form on errors.
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className="space-y-7"
    >
      {task ? <input type="hidden" name="id" value={task.id} /> : null}
      <input type="hidden" name="return_to" value={returnTo} />

      {state.formError || errorCount > 0 ? (
        <div role="alert" className="rounded-surface bg-surface p-4 text-small font-medium text-danger">
          {state.formError ?? (errorCount === 1 ? "One thing needs fixing below." : `${errorCount} things need fixing below.`)}
        </div>
      ) : null}

      <div>
        <label htmlFor="title" className="mb-2 block font-medium text-ink">
          Task
        </label>
        <input
          id="title"
          name="title"
          data-field="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          autoComplete="off"
          enterKeyHint="done"
          required
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? "title-error" : undefined}
          className={`${inputClass} h-12`}
        />
        <FieldError id="title-error" message={errors.title} />
      </div>

      <fieldset>
        <legend className="mb-2 font-medium text-ink">Repeats</legend>
        <div className="grid grid-cols-3 gap-2" data-field="repeat" tabIndex={-1}>
          {REPEAT_OPTIONS.map((option) => (
            <PillOption
              key={option.value}
              type="radio"
              name="repeat"
              value={option.value}
              checked={repeat === option.value}
              onChange={() => setRepeat(option.value)}
            >
              {option.label}
            </PillOption>
          ))}
        </div>
        <FieldError id="repeat-error" message={errors.repeat} />
      </fieldset>

      {repeat === "weekly" ? (
        <fieldset aria-describedby={errors.weekdays ? "weekdays-error" : undefined}>
          <legend className="mb-2 font-medium text-ink">On these days</legend>
          <div className="grid grid-cols-7 gap-1.5" data-field="weekdays" tabIndex={-1}>
            {WEEKDAY_FORM_ORDER.map((day) => (
              <PillOption
                key={day}
                type="checkbox"
                name="weekdays"
                value={String(day)}
                checked={weekdays.includes(day)}
                onChange={(on) => toggleWeekday(day, on)}
                srLabel={WEEKDAY_LONG[day]}
                className="[&_.pill]:px-0 [&_.pill]:text-label"
              >
                {WEEKDAY_SHORT[day]}
              </PillOption>
            ))}
          </div>
          <FieldError id="weekdays-error" message={errors.weekdays} />
        </fieldset>
      ) : null}

      <div>
        <label htmlFor="due_date" className="mb-1 block font-medium text-ink">
          {repeat === "none" ? "Due date" : "Starts on"} <span className="font-normal text-ink-muted">(optional)</span>
        </label>
        <p id="due_date-hint" className="mb-2 text-small text-ink-muted">
          {repeat === "none"
            ? "Leave it empty to keep the task in your backlog."
            : "Leave it empty to start today."}
        </p>
        <input
          id="due_date"
          name="due_date"
          data-field="due_date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          aria-invalid={errors.due_date ? true : undefined}
          aria-describedby={`due_date-hint${errors.due_date ? " due_date-error" : ""}`}
          className={`${inputClass} h-12 appearance-none`}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            { label: "Today", value: today },
            { label: "Tomorrow", value: addDays(today, 1) },
          ].map((quick) => (
            <button
              key={quick.label}
              type="button"
              onClick={() => setDueDate(quick.value)}
              aria-pressed={dueDate === quick.value}
              className={`inline-flex min-h-11 items-center rounded-control border px-4 text-small font-medium ${
                dueDate === quick.value ? "border-action bg-action text-action-ink" : "border-edge bg-ground text-ink"
              }`}
            >
              {quick.label}
            </button>
          ))}
          {dueDate ? (
            <button
              type="button"
              onClick={() => setDueDate("")}
              className="inline-flex min-h-11 items-center rounded-control px-4 text-small font-medium text-ink underline"
            >
              Clear date
            </button>
          ) : null}
        </div>
        <FieldError id="due_date-error" message={errors.due_date} />
      </div>

      <fieldset>
        <legend className="mb-2 font-medium text-ink">Time of day</legend>
        <div className="grid grid-cols-2 gap-2" data-field="time_of_day" tabIndex={-1}>
          {TIMES_OF_DAY.map((value) => (
            <PillOption
              key={value}
              type="radio"
              name="time_of_day"
              value={value}
              checked={timeOfDay === value}
              onChange={() => setTimeOfDay(value)}
            >
              {TIME_OF_DAY_LABELS[value]}
            </PillOption>
          ))}
        </div>
        <FieldError id="time_of_day-error" message={errors.time_of_day} />
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-medium text-ink">
          Category <span className="font-normal text-ink-muted">(optional)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {[{ value: "", label: "None" }, ...PRESET_CATEGORIES.map((c) => ({ value: c, label: c })), { value: "custom", label: "Other" }].map(
            (option) => (
              <PillOption
                key={option.value || "none"}
                type="radio"
                name="category"
                value={option.value}
                checked={categoryChoice === option.value}
                onChange={() => setCategoryChoice(option.value)}
              >
                {option.label}
              </PillOption>
            ),
          )}
        </div>
        {categoryChoice === "custom" ? (
          <div className="mt-3">
            <label htmlFor="category_custom" className="mb-2 block text-small font-medium text-ink">
              Category name
            </label>
            <input
              id="category_custom"
              name="category_custom"
              data-field="category"
              type="text"
              value={categoryCustom}
              onChange={(e) => setCategoryCustom(e.target.value)}
              maxLength={40}
              autoComplete="off"
              aria-invalid={errors.category ? true : undefined}
              aria-describedby={errors.category ? "category-error" : undefined}
              className={`${inputClass} h-12`}
            />
          </div>
        ) : null}
        <FieldError id="category-error" message={errors.category} />
      </fieldset>

      <div>
        <label htmlFor="notes" className="mb-2 block font-medium text-ink">
          Notes <span className="font-normal text-ink-muted">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          data-field="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={2000}
          aria-invalid={errors.notes ? true : undefined}
          aria-describedby={errors.notes ? "notes-error" : undefined}
          className={`${inputClass} rounded-surface py-3`}
        />
        <FieldError id="notes-error" message={errors.notes} />
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-control bg-action px-6 font-medium text-action-ink transition-opacity disabled:opacity-70"
        >
          {pending ? "Saving…" : isNew ? "Add task" : "Save changes"}
        </button>
        <Link
          href={cancelHref}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-control border border-edge bg-ground px-6 font-medium text-ink"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
