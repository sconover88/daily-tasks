import { describe, expect, it } from "vitest";
import { addDays } from "./dates";
import { computeStreak } from "./streak";

// Friday Nov 13 2026. Its week runs Mon Nov 9 – Sun Nov 15.
const TODAY = "2026-11-13";

/** Every date from `from` to `to`, inclusive, except `skip`. */
function range(from: string, to: string, skip: string[] = []): string[] {
  const out: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) if (!skip.includes(d)) out.push(d);
  return out;
}

describe("computeStreak", () => {
  it("is zero with no history", () => {
    expect(computeStreak([], TODAY)).toEqual({ streak: 0, doneToday: false, skipUsedThisWeek: true });
  });

  it("counts an unbroken run including today", () => {
    const result = computeStreak(range("2026-11-04", TODAY), TODAY);
    expect(result).toEqual({ streak: 10, doneToday: true, skipUsedThisWeek: false });
  });

  it("doesn't break just because today isn't done yet", () => {
    const result = computeStreak(range("2026-11-04", "2026-11-12"), TODAY);
    expect(result.streak).toBe(9);
    expect(result.doneToday).toBe(false);
  });

  it("forgives one missed day in a week (and the skip doesn't add)", () => {
    // Missed Wed Nov 11.
    const result = computeStreak(range("2026-11-04", TODAY, ["2026-11-11"]), TODAY);
    expect(result.streak).toBe(9);
    expect(result.skipUsedThisWeek).toBe(true);
  });

  it("resets on a second missed day in the same week", () => {
    // Missed Tue Nov 10 and Wed Nov 11: only Thu and Fri count.
    const result = computeStreak(range("2026-11-04", TODAY, ["2026-11-10", "2026-11-11"]), TODAY);
    expect(result.streak).toBe(2);
  });

  it("allows one miss in each of several weeks", () => {
    // Missed Thu Nov 5 (week of Nov 2) and Wed Nov 11 (week of Nov 9).
    const result = computeStreak(range("2026-11-02", TODAY, ["2026-11-05", "2026-11-11"]), TODAY);
    expect(result.streak).toBe(10);
  });

  it("treats Monday as the start of a new week", () => {
    // Sun Nov 8 missed (week of Nov 2) and Mon Nov 9 missed (week of Nov 9): different weeks.
    const result = computeStreak(range("2026-11-02", TODAY, ["2026-11-08", "2026-11-09"]), TODAY);
    expect(result.streak).toBe(10);
    // Sat Nov 7 and Sun Nov 8 are the same week: reset.
    const broken = computeStreak(range("2026-11-02", TODAY, ["2026-11-07", "2026-11-08"]), TODAY);
    expect(broken.streak).toBe(5);
  });

  it("uses this week's skip when yesterday was missed and today isn't done", () => {
    const result = computeStreak(range("2026-11-04", "2026-11-11"), TODAY);
    expect(result.streak).toBe(8);
    expect(result.skipUsedThisWeek).toBe(true);
  });

  it("is zero when two days in a row this week are missed", () => {
    const result = computeStreak(range("2026-11-04", "2026-11-10"), TODAY);
    expect(result.streak).toBe(0);
  });

  it("ignores duplicate and future dates", () => {
    const result = computeStreak([TODAY, TODAY, "2026-11-12", "2026-11-20"], TODAY);
    expect(result.streak).toBe(2);
  });

  it("on a Monday, last week's misses don't count as this week's skip", () => {
    const monday = "2026-11-16";
    const result = computeStreak(range("2026-11-09", "2026-11-15", ["2026-11-14"]), monday);
    expect(result.skipUsedThisWeek).toBe(false);
    expect(result.streak).toBe(6);
  });
});
