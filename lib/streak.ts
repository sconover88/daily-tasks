import { addDays, weekStart } from "./dates";
import type { DateString } from "./types";

export type StreakResult = {
  /** Days in a row with at least one task done. Skipped days don't add. */
  streak: number;
  /** At least one task done today. */
  doneToday: boolean;
  /** A day earlier this week (Mon until yesterday) had nothing done. */
  skipUsedThisWeek: boolean;
};

/**
 * Forgiving streak.
 *
 * - A day counts when at least one task was completed that day.
 * - Each Mon–Sun week allows one missed day without breaking the streak.
 * - A second missed day in the same week ends it.
 * - Today never breaks the streak while it's still today.
 *
 * @param completionDates every date with a completion (duplicates fine)
 * @param today the current date in the app's time zone
 */
export function computeStreak(completionDates: Iterable<DateString>, today: DateString): StreakResult {
  const active = new Set<DateString>();
  let earliest: DateString | null = null;
  for (const date of completionDates) {
    if (date > today) continue;
    active.add(date);
    if (earliest === null || date < earliest) earliest = date;
  }

  const doneToday = active.has(today);

  const thisWeek = weekStart(today);
  let skipUsedThisWeek = false;
  for (let d = thisWeek; d < today; d = addDays(d, 1)) {
    if (!active.has(d)) {
      skipUsedThisWeek = true;
      break;
    }
  }

  if (earliest === null) return { streak: 0, doneToday, skipUsedThisWeek };

  let streak = 0;
  const missesByWeek = new Map<DateString, number>();
  // Today only counts if it's done; otherwise start from yesterday.
  let cursor = doneToday ? today : addDays(today, -1);

  while (cursor >= earliest) {
    if (active.has(cursor)) {
      streak += 1;
    } else {
      const week = weekStart(cursor);
      const misses = (missesByWeek.get(week) ?? 0) + 1;
      if (misses > 1) break;
      missesByWeek.set(week, misses);
    }
    cursor = addDays(cursor, -1);
  }

  return { streak, doneToday, skipUsedThisWeek };
}
