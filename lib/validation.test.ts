import { describe, expect, it } from "vitest";
import { parseTaskForm, readTaskForm, type TaskFormValues } from "./validation";

function values(overrides: Partial<TaskFormValues> = {}): TaskFormValues {
  return {
    title: "Take medicine",
    notes: "",
    categoryChoice: "",
    categoryCustom: "",
    time_of_day: "morning",
    repeat: "daily",
    weekdays: [],
    times_per_week: "",
    due_date: "",
    ...overrides,
  };
}

describe("parseTaskForm", () => {
  it("accepts a simple daily task and turns blanks into nulls", () => {
    const result = parseTaskForm(values({ title: "  Take medicine  " }));
    expect(result).toEqual({
      ok: true,
      data: {
        title: "Take medicine",
        notes: null,
        category: null,
        time_of_day: "morning",
        repeat: "daily",
        weekdays: [],
        times_per_week: null,
        due_date: null,
      },
    });
  });

  it("requires a title", () => {
    const result = parseTaskForm(values({ title: "   " }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.title).toBe("Give the task a name.");
  });

  it("limits title length", () => {
    const result = parseTaskForm(values({ title: "x".repeat(201) }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.title).toMatch(/200/);
  });

  it("accepts weekly with no days as N times a week", () => {
    const result = parseTaskForm(values({ repeat: "weekly", weekdays: [], times_per_week: "2" }));
    expect(result.ok && result.data).toMatchObject({ repeat: "weekly", weekdays: [], times_per_week: 2 });
  });

  it("needs a valid times-a-week count when no days are picked", () => {
    for (const times of ["", "0", "8", "1.5", "lots"]) {
      const result = parseTaskForm(values({ repeat: "weekly", weekdays: [], times_per_week: times }));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors.times_per_week).toBe("Pick how many times a week.");
    }
  });

  it("ignores times a week when days are picked, or for other repeats", () => {
    const withDays = parseTaskForm(values({ repeat: "weekly", weekdays: ["1"], times_per_week: "3" }));
    expect(withDays.ok && withDays.data.times_per_week).toBe(null);
    const daily = parseTaskForm(values({ repeat: "daily", times_per_week: "3" }));
    expect(daily.ok && daily.data.times_per_week).toBe(null);
  });

  it("dedupes and sorts weekdays", () => {
    const result = parseTaskForm(values({ repeat: "weekly", weekdays: ["5", "1", "5"] }));
    expect(result.ok && result.data.weekdays).toEqual([1, 5]);
  });

  it("drops weekdays for non-weekly tasks", () => {
    const result = parseTaskForm(values({ repeat: "none", weekdays: ["1"] }));
    expect(result.ok && result.data.weekdays).toEqual([]);
  });

  it("rejects bad dates and unknown options", () => {
    const result = parseTaskForm(values({ due_date: "2026-02-30", time_of_day: "midnight", repeat: "hourly" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.due_date).toBe("Pick a valid date.");
      expect(result.errors.time_of_day).toBeDefined();
      expect(result.errors.repeat).toBeDefined();
    }
  });

  it("uses a preset or custom category", () => {
    const preset = parseTaskForm(values({ categoryChoice: "Health" }));
    expect(preset.ok && preset.data.category).toBe("Health");
    const research = parseTaskForm(values({ categoryChoice: "Research" }));
    expect(research.ok && research.data.category).toBe("Research");
    const custom = parseTaskForm(values({ categoryChoice: "custom", categoryCustom: " Garden " }));
    expect(custom.ok && custom.data.category).toBe("Garden");
    const emptyCustom = parseTaskForm(values({ categoryChoice: "custom", categoryCustom: " " }));
    expect(emptyCustom.ok).toBe(false);
    if (!emptyCustom.ok) expect(emptyCustom.errors.category).toMatch(/category name/);
  });
});

describe("readTaskForm", () => {
  it("reads every field from form data", () => {
    const form = new FormData();
    form.set("title", "Laundry");
    form.set("category", "Chores");
    form.set("time_of_day", "evening");
    form.set("repeat", "weekly");
    form.append("weekdays", "0");
    form.append("weekdays", "3");
    form.set("due_date", "2026-11-15");
    expect(readTaskForm(form)).toEqual({
      title: "Laundry",
      notes: "",
      categoryChoice: "Chores",
      categoryCustom: "",
      time_of_day: "evening",
      repeat: "weekly",
      weekdays: ["0", "3"],
      times_per_week: "",
      due_date: "2026-11-15",
    });
  });
});
