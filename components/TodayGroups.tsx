import { formatShortDate } from "@/lib/dates";
import { describeRepeat, groupByTimeOfDay, type TodayItem } from "@/lib/recurrence";
import { TIME_OF_DAY_LABELS, type DateString } from "@/lib/types";
import TaskRow from "./TaskRow";

/** Today's tasks under Morning / Afternoon / Evening / Anytime headings. */
export default function TodayGroups({ items, today }: { items: TodayItem[]; today: DateString }) {
  const groups = groupByTimeOfDay(items);
  return (
    <div className="space-y-8">
      {groups.map((group) => {
        const remaining = group.items.filter((i) => !i.done).length;
        const headingId = `group-${group.timeOfDay}`;
        return (
          <section key={group.timeOfDay} aria-labelledby={headingId}>
            <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
              <h2 id={headingId} className="font-display text-heading font-medium text-ink">
                {TIME_OF_DAY_LABELS[group.timeOfDay]}
              </h2>
              <p className="text-small text-ink-muted">{remaining === 0 ? "All done" : `${remaining} left`}</p>
            </div>
            <ul className="space-y-2">
              {group.items.map(({ task, done, overdue }) => {
                const tags: string[] = [];
                if (task.repeat !== "none") tags.push(describeRepeat(task));
                if (task.category) tags.push(task.category);
                return (
                  <TaskRow
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    done={done}
                    tags={tags}
                    warning={overdue && task.due_date ? `Overdue since ${formatShortDate(task.due_date, today)}` : undefined}
                    editHref={`/tasks/${task.id}?from=/`}
                  />
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
