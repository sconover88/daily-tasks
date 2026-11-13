import type { DateString } from "./types";

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** True when `value` is a real calendar date written as YYYY-MM-DD. */
export function isDateString(value: string): boolean {
  const match = DATE_RE.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** True when `timeZone` is an IANA zone this runtime understands. */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** The calendar date it is right now in `timeZone`, as YYYY-MM-DD. */
export function todayInZone(timeZone: string, now: Date = new Date()): DateString {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

// Dates are handled as UTC midnights so adding days never trips over daylight saving.
function toUtc(date: DateString): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function fromUtc(date: Date): DateString {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: DateString, days: number): DateString {
  const d = toUtc(date);
  d.setUTCDate(d.getUTCDate() + days);
  return fromUtc(d);
}

/** 0 = Sunday ... 6 = Saturday. */
export function weekdayOf(date: DateString): number {
  return toUtc(date).getUTCDay();
}

/** The Monday that starts the Mon–Sun week containing `date`. */
export function weekStart(date: DateString): DateString {
  const daysSinceMonday = (weekdayOf(date) + 6) % 7;
  return addDays(date, -daysSinceMonday);
}

/** "Friday, Nov 13" */
export function formatLongDate(date: DateString): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(toUtc(date));
}

/** "Nov 13" or "Nov 13, 2025" when not in `currentYear`'s year. */
export function formatShortDate(date: DateString, today?: DateString): string {
  const sameYear = today ? today.slice(0, 4) === date.slice(0, 4) : true;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
    timeZone: "UTC",
  }).format(toUtc(date));
}

/** "Today", "Yesterday", "Tomorrow", or a short date. */
export function relativeDayLabel(date: DateString, today: DateString): string {
  if (date === today) return "Today";
  if (date === addDays(today, -1)) return "Yesterday";
  if (date === addDays(today, 1)) return "Tomorrow";
  return formatShortDate(date, today);
}
