import { describe, expect, it } from "vitest";
import {
  addDays,
  formatLongDate,
  isDateString,
  isValidTimeZone,
  relativeDayLabel,
  todayInZone,
  weekdayOf,
  weekStart,
} from "./dates";

describe("todayInZone", () => {
  it("uses the zone's calendar date, not UTC's, around midnight", () => {
    // 05:30 UTC on Nov 14 is still 10:30pm Nov 13 in Denver (MST, UTC-7).
    const now = new Date("2026-11-14T05:30:00Z");
    expect(todayInZone("UTC", now)).toBe("2026-11-14");
    expect(todayInZone("America/Denver", now)).toBe("2026-11-13");
  });

  it("rolls over exactly at local midnight", () => {
    expect(todayInZone("America/Denver", new Date("2026-11-14T06:59:59Z"))).toBe("2026-11-13");
    expect(todayInZone("America/Denver", new Date("2026-11-14T07:00:00Z"))).toBe("2026-11-14");
  });

  it("follows daylight saving in Denver but not in Phoenix", () => {
    // July: Denver is UTC-6 (MDT), Phoenix stays UTC-7 (MST).
    const now = new Date("2026-07-15T06:30:00Z");
    expect(todayInZone("America/Denver", now)).toBe("2026-07-15");
    expect(todayInZone("America/Phoenix", now)).toBe("2026-07-14");
  });
});

describe("date math", () => {
  it("adds days across months, years and DST changes", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    // US DST starts Mar 8 2026 and ends Nov 1 2026.
    expect(addDays("2026-03-07", 2)).toBe("2026-03-09");
    expect(addDays("2026-10-31", 2)).toBe("2026-11-02");
  });

  it("knows the weekday", () => {
    expect(weekdayOf("2026-11-13")).toBe(5); // Friday
    expect(weekdayOf("2026-11-15")).toBe(0); // Sunday
  });

  it("starts weeks on Monday", () => {
    expect(weekStart("2026-11-09")).toBe("2026-11-09"); // Monday
    expect(weekStart("2026-11-13")).toBe("2026-11-09"); // Friday
    expect(weekStart("2026-11-15")).toBe("2026-11-09"); // Sunday belongs to the week before
  });

  it("validates date strings", () => {
    expect(isDateString("2026-11-13")).toBe(true);
    expect(isDateString("2026-02-30")).toBe(false);
    expect(isDateString("11/13/2026")).toBe(false);
  });

  it("validates time zones", () => {
    expect(isValidTimeZone("America/Denver")).toBe(true);
    expect(isValidTimeZone("Not/AZone")).toBe(false);
  });
});

describe("labels", () => {
  it("formats dates for people", () => {
    expect(formatLongDate("2026-11-13")).toBe("Friday, Nov 13");
    expect(relativeDayLabel("2026-11-13", "2026-11-13")).toBe("Today");
    expect(relativeDayLabel("2026-11-12", "2026-11-13")).toBe("Yesterday");
    expect(relativeDayLabel("2026-11-14", "2026-11-13")).toBe("Tomorrow");
    expect(relativeDayLabel("2026-11-01", "2026-11-13")).toBe("Nov 1");
    expect(relativeDayLabel("2025-12-30", "2026-11-13")).toBe("Dec 30, 2025");
  });
});
