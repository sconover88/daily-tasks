import { describe, expect, it } from "vitest";
import {
  backlogTasks,
  buildTodayItems,
  buildWeeklyItems,
  describeRepeat,
  isFlexibleWeekly,
  groupByTimeOfDay,
  isDueOn,
  isOverdue,
  repeatingTasks,
} from "./recurrence";
import type { Task } from "./types";

const FRIDAY = "2026-11-13";
const SATURDAY = "2026-11-14";

function task(overrides: Partial<Task>): Task {
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    title: "Task",
    notes: null,
    category: null,
    time_of_day: "anytime",
    repeat: "none",
    weekdays: null,
    times_per_week: null,
    due_date: null,
    completed_at: null,
    created_at: "2026-11-01T12:00:00Z",
    ...overrides,
  };
}

describe("isDueOn", () => {
  it("daily tasks are due every day", () => {
    const t = task({ repeat: "daily" });
    expect(isDueOn(t, FRIDAY)).toBe(true);
    expect(isDueOn(t, SATURDAY)).toBe(true);
  });

  it("daily tasks with a start date wait for it", () => {
    const t = task({ repeat: "daily", due_date: SATURDAY });
    expect(isDueOn(t, FRIDAY)).toBe(false);
    expect(isDueOn(t, SATURDAY)).toBe(true);
  });

  it("weekly tasks are due only on chosen days", () => {
    const t = task({ repeat: "weekly", weekdays: [1, 3, 5] }); // Mon, Wed, Fri
    expect(isDueOn(t, FRIDAY)).toBe(true);
    expect(isDueOn(t, SATURDAY)).toBe(false);
    expect(isDueOn(t, "2026-11-16")).toBe(true); // Monday
  });

  it("one-time tasks without a date stay in the backlog", () => {
    expect(isDueOn(task({}), FRIDAY)).toBe(false);
  });

  it("one-time tasks are due on their date and after (overdue)", () => {
    const t = task({ due_date: "2026-11-10" });
    expect(isDueOn(t, "2026-11-09")).toBe(false);
    expect(isDueOn(t, "2026-11-10")).toBe(true);
    expect(isDueOn(t, FRIDAY)).toBe(true);
    expect(isOverdue(t, "2026-11-10")).toBe(false);
    expect(isOverdue(t, FRIDAY)).toBe(true);
  });

  it("finished one-time tasks are never due", () => {
    const t = task({ due_date: FRIDAY, completed_at: "2026-11-13T15:00:00Z" });
    expect(isDueOn(t, FRIDAY)).toBe(false);
    expect(isOverdue(t, SATURDAY)).toBe(false);
  });
});

describe("buildTodayItems", () => {
  it("includes due, overdue and done-today tasks, but not finished-earlier ones", () => {
    const medicine = task({ id: "med", repeat: "daily" });
    const trash = task({ id: "trash", repeat: "weekly", weekdays: [5] });
    const laundry = task({ id: "laundry", repeat: "weekly", weekdays: [0] });
    const overdueReturn = task({ id: "return", due_date: "2026-11-10" });
    const boughtStamps = task({ id: "stamps", due_date: FRIDAY, completed_at: "2026-11-13T16:00:00Z" });
    const oldDone = task({ id: "old", due_date: "2026-11-01", completed_at: "2026-11-01T16:00:00Z" });
    const someday = task({ id: "someday" });

    const items = buildTodayItems(
      [medicine, trash, laundry, overdueReturn, boughtStamps, oldDone, someday],
      new Set(["med", "stamps"]),
      FRIDAY,
    );
    const byId = Object.fromEntries(items.map((i) => [i.task.id, i]));

    expect(Object.keys(byId).sort()).toEqual(["med", "return", "stamps", "trash"]);
    expect(byId.med.done).toBe(true);
    expect(byId.trash.done).toBe(false);
    expect(byId.stamps.done).toBe(true);
    expect(byId.return.overdue).toBe(true);
  });

  it("a daily task done yesterday is fresh again today (resets on schedule)", () => {
    const medicine = task({ id: "med", repeat: "daily" });
    const items = buildTodayItems([medicine], new Set(), SATURDAY);
    expect(items).toHaveLength(1);
    expect(items[0].done).toBe(false);
  });
});

describe("flexible weekly tasks (no set days)", () => {
  // Week of Mon Nov 9 – Sun Nov 15. FRIDAY is Nov 13.
  const laundry = task({ id: "laundry", repeat: "weekly", weekdays: null, times_per_week: 2 });
  const vacuum = task({ id: "vacuum", repeat: "weekly", weekdays: [], times_per_week: 1, created_at: "2026-11-02T00:00:00Z" });

  it("are never on a specific day's list", () => {
    expect(isFlexibleWeekly(laundry)).toBe(true);
    expect(isFlexibleWeekly(task({ repeat: "weekly", weekdays: [5] }))).toBe(false);
    expect(isDueOn(laundry, FRIDAY)).toBe(false);
    expect(buildTodayItems([laundry], new Set(), FRIDAY)).toEqual([]);
  });

  it("count this week's check-offs toward the target", () => {
    const items = buildWeeklyItems(
      [laundry, vacuum],
      [
        { task_id: "laundry", completed_on: "2026-11-08" }, // last week: ignored
        { task_id: "laundry", completed_on: "2026-11-10" },
        { task_id: "vacuum", completed_on: FRIDAY },
      ],
      FRIDAY,
    );
    const byId = Object.fromEntries(items.map((i) => [i.task.id, i]));
    expect(byId.laundry).toMatchObject({ count: 1, target: 2, doneToday: false, complete: false });
    expect(byId.vacuum).toMatchObject({ count: 1, target: 1, doneToday: true, complete: true });
  });

  it("reset on Monday", () => {
    const items = buildWeeklyItems(
      [laundry],
      [
        { task_id: "laundry", completed_on: "2026-11-10" },
        { task_id: "laundry", completed_on: "2026-11-12" },
      ],
      "2026-11-16",
    );
    expect(items[0]).toMatchObject({ count: 0, complete: false });
  });

  it("wait for their start date and leave other tasks out", () => {
    const later = task({ id: "later", repeat: "weekly", weekdays: null, times_per_week: 1, due_date: "2026-11-20" });
    const daily = task({ id: "daily", repeat: "daily" });
    expect(buildWeeklyItems([later, daily], [], FRIDAY)).toEqual([]);
  });

  it("describe their schedule", () => {
    expect(describeRepeat(laundry)).toBe("Twice a week");
    expect(describeRepeat(vacuum)).toBe("Once a week");
    expect(describeRepeat({ repeat: "weekly", weekdays: null, times_per_week: 3 })).toBe("3 times a week");
  });
});

describe("groupByTimeOfDay", () => {
  it("orders morning → anytime, drops empty groups and puts overdue first", () => {
    const groups = groupByTimeOfDay([
      { task: task({ id: "a", time_of_day: "evening" }), done: false, overdue: false },
      { task: task({ id: "b", time_of_day: "morning", created_at: "2026-11-02T00:00:00Z" }), done: false, overdue: false },
      { task: task({ id: "c", time_of_day: "morning", created_at: "2026-11-03T00:00:00Z" }), done: false, overdue: true },
    ]);
    expect(groups.map((g) => g.timeOfDay)).toEqual(["morning", "evening"]);
    expect(groups[0].items.map((i) => i.task.id)).toEqual(["c", "b"]);
  });
});

describe("backlog", () => {
  it("holds undated and future one-time tasks only", () => {
    const tasks = [
      task({ id: "undated" }),
      task({ id: "future", due_date: "2026-11-20" }),
      task({ id: "today", due_date: FRIDAY }),
      task({ id: "done", completed_at: "2026-11-12T00:00:00Z" }),
      task({ id: "daily", repeat: "daily" }),
    ];
    expect(backlogTasks(tasks, FRIDAY).map((t) => t.id)).toEqual(["future", "undated"]);
    expect(repeatingTasks(tasks).map((t) => t.id)).toEqual(["daily"]);
  });
});

describe("describeRepeat", () => {
  it("reads naturally", () => {
    expect(describeRepeat({ repeat: "none", weekdays: null })).toBe("One-time");
    expect(describeRepeat({ repeat: "daily", weekdays: null })).toBe("Daily");
    expect(describeRepeat({ repeat: "weekly", weekdays: [5, 1, 3] })).toBe("Mon, Wed, Fri");
    expect(describeRepeat({ repeat: "weekly", weekdays: [0] })).toBe("Sun");
    expect(describeRepeat({ repeat: "weekly", weekdays: [1, 2, 3, 4, 5] })).toBe("Weekdays");
    expect(describeRepeat({ repeat: "weekly", weekdays: [6, 0] })).toBe("Weekends");
  });
});
