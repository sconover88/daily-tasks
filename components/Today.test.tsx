import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { TodayItem } from "@/lib/recurrence";
import type { Task } from "@/lib/types";
import StreakPanel from "./StreakPanel";
import TodayGroups from "./TodayGroups";
import WeeklySection from "./WeeklySection";

vi.mock("@/app/actions", () => ({
  setTaskDone: vi.fn(async () => ({ ok: true })),
  doToday: vi.fn(async () => ({ ok: true })),
}));

function task(overrides: Partial<Task>): Task {
  return {
    id: overrides.id ?? "id",
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

describe("TodayGroups", () => {
  const items: TodayItem[] = [
    { task: task({ id: "1", title: "Take medicine", time_of_day: "morning", repeat: "daily", category: "Health" }), done: true, overdue: false },
    { task: task({ id: "2", title: "Take out trash", time_of_day: "evening", repeat: "weekly", weekdays: [5] }), done: false, overdue: false },
    { task: task({ id: "3", title: "Make a return", due_date: "2026-11-10" }), done: false, overdue: true },
  ];

  it("groups tasks under time-of-day headings in order", () => {
    render(<TodayGroups items={items} today="2026-11-13" />);
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(["Morning", "Evening", "Anytime"]);
    const morning = screen.getByRole("region", { name: "Morning" });
    expect(within(morning).getByText("Take medicine")).toBeInTheDocument();
    expect(within(morning).getByText("All done")).toBeInTheDocument();
  });

  it("exposes each task as a labelled checkbox with its state", () => {
    render(<TodayGroups items={items} today="2026-11-13" />);
    expect(screen.getByRole("checkbox", { name: "Take medicine" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("checkbox", { name: "Take out trash" })).toHaveAttribute("aria-checked", "false");
  });

  it("flags overdue one-time tasks", () => {
    render(<TodayGroups items={items} today="2026-11-13" />);
    expect(screen.getByText("Overdue since Nov 10")).toBeInTheDocument();
  });
});

describe("WeeklySection", () => {
  const laundry = task({ id: "w1", title: "Laundry", repeat: "weekly", times_per_week: 2 });
  const vacuum = task({ id: "w2", title: "Vacuum", repeat: "weekly", times_per_week: 1 });

  it("shows this week's progress for each task", () => {
    render(
      <WeeklySection
        items={[
          { task: laundry, count: 1, target: 2, doneToday: true, complete: false },
          { task: vacuum, count: 1, target: 1, doneToday: false, complete: true },
        ]}
      />,
    );
    const section = screen.getByRole("region", { name: "This week" });
    expect(within(section).getByText("1 of 2 this week")).toBeInTheDocument();
    expect(within(section).getByText("Done for the week · 1 of 1")).toBeInTheDocument();
    expect(within(section).getByText("1 to go")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Laundry" })).toHaveAttribute("aria-checked", "true");
  });

  it("renders nothing with no weekly tasks", () => {
    const { container } = render(<WeeklySection items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("StreakPanel", () => {
  it("shows the done-today status once a task is done", () => {
    render(<StreakPanel streak={5} doneToday skipUsedThisWeek={false} />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByTestId("goal-status")).toHaveTextContent("Done today");
    expect(screen.getByText("available")).toBeInTheDocument();
  });

  it("nudges when nothing is done yet and the skip is used", () => {
    render(<StreakPanel streak={3} doneToday={false} skipUsedThisWeek />);
    expect(screen.getByTestId("goal-status")).toHaveTextContent("Not yet today");
    expect(screen.getByRole("status")).toHaveTextContent("Finish one task today to keep your streak.");
    expect(screen.getByText("used")).toBeInTheDocument();
  });

  it("invites a first task with no streak", () => {
    render(<StreakPanel streak={0} doneToday={false} skipUsedThisWeek />);
    expect(screen.getByRole("status")).toHaveTextContent("Finish one task to start a streak.");
    expect(screen.queryByText(/Free skip/)).not.toBeInTheDocument();
  });
});
