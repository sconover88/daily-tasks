import "server-only";
import { isValidTimeZone, todayInZone } from "./dates";
import type { DateString } from "./types";

export const DEFAULT_TIME_ZONE = "America/Denver";

/** The zone that decides when "today" rolls over. Falls back to Mountain time. */
export function getTimeZone(): string {
  const zone = process.env.APP_TIME_ZONE?.trim();
  return zone && isValidTimeZone(zone) ? zone : DEFAULT_TIME_ZONE;
}

export function getToday(): DateString {
  return todayInZone(getTimeZone());
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SECRET_KEY?.trim());
}
