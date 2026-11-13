import type { StreakResult } from "@/lib/streak";
import { CheckIcon } from "./icons";

function message({ streak, doneToday, skipUsedThisWeek }: StreakResult): string {
  if (doneToday) return "Today's goal is done. Anything else is a bonus.";
  if (streak === 0) return "Finish one task to start a streak.";
  if (skipUsedThisWeek) return "Finish one task today to keep your streak.";
  return "Finish one task today. Your free skip is still there if you need it.";
}

/** The streak number at display size, the daily goal status and the weekly skip. */
export default function StreakPanel(props: StreakResult) {
  const { streak, doneToday, skipUsedThisWeek } = props;
  return (
    <section aria-labelledby="streak-heading" className="rounded-surface bg-surface p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-display font-medium tracking-[-0.03em] tabular-nums text-ink">{streak}</p>
          <h2 id="streak-heading" className="mt-1 text-small font-medium text-ink-secondary">
            {streak === 1 ? "day streak" : "days in a row"}
          </h2>
        </div>
        <p
          data-testid="goal-status"
          className={`inline-flex items-center gap-1.5 rounded-control px-3 py-1.5 text-small font-semibold ${
            doneToday ? "bg-accent text-inverse-ink" : "bg-ground text-ink-secondary"
          }`}
        >
          {doneToday ? <CheckIcon size={16} /> : null}
          {doneToday ? "Done today" : "Not yet today"}
        </p>
      </div>
      <p className="mt-4 text-body text-ink-secondary" role="status">
        {message(props)}
      </p>
      {streak > 0 ? (
        <p className="mt-2 text-small text-ink-muted">
          Free skip this week:{" "}
          <span className="font-semibold text-ink-secondary">{skipUsedThisWeek ? "used" : "available"}</span>
        </p>
      ) : null}
    </section>
  );
}
