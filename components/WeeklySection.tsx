import type { WeeklyItem } from "@/lib/recurrence";
import TaskRow from "./TaskRow";

/**
 * Weekly tasks with no set days. Check one off on any day; the count
 * resets every Monday.
 */
export default function WeeklySection({ items }: { items: WeeklyItem[] }) {
  if (items.length === 0) return null;
  const toGo = items.filter((i) => !i.complete).length;

  return (
    <section aria-labelledby="group-this-week">
      <div className="mb-1 flex items-baseline justify-between gap-3 px-1">
        <h2 id="group-this-week" className="font-display text-heading font-medium text-ink">
          This week
        </h2>
        <p className="text-small text-ink-muted">{toGo === 0 ? "All done" : `${toGo} to go`}</p>
      </div>
      <p className="mb-3 px-1 text-small text-ink-muted">Any day works. Resets Monday.</p>
      <ul className="space-y-2">
        {items.map(({ task, count, target, doneToday, complete }) => (
          <TaskRow
            key={task.id}
            id={task.id}
            title={task.title}
            done={doneToday}
            detail={complete ? `Done for the week · ${count} of ${target}` : `${count} of ${target} this week`}
            tags={task.category ? [task.category] : []}
            editHref={`/tasks/${task.id}?from=/`}
          />
        ))}
      </ul>
    </section>
  );
}
