const ALLOWED = new Set(["/", "/backlog", "/done"]);

/** Only allow returning to one of the app's own tabs. */
export function safeReturnPath(value: string | string[] | undefined, fallback = ""): string {
  const v = Array.isArray(value) ? value[0] : value;
  return v && ALLOWED.has(v) ? v : fallback;
}
