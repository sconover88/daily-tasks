import Link from "next/link";
import { connection } from "next/server";
import PageHeader from "@/components/PageHeader";
import SetupNotice from "@/components/SetupNotice";
import TaskRow from "@/components/TaskRow";
import { getToday, isSupabaseConfigured } from "@/lib/config";
import { listTasks } from "@/lib/data";
import { formatShortDate } from "@/lib/dates";
import { backlogTasks, describeRepeat, repeatingTasks } from "@/lib/recurrence";
import { TIME_OF_DAY_LABELS } from "@/lib/types";

export const metadata = { title: "Backlog" };

export default async function BacklogPage() {
  await connection();
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const today = getToday();
  const tasks = await listTasks();
  const later = backlogTasks(tasks, today);
  const repeating = repeatingTasks(tasks);

  return (
    <>
      <PageHeader title="Backlog" eyebrow="Whenever you're ready">
        Things to get to, plus your routines.
      </PageHeader>

      <section aria-labelledby="later-heading">
        <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
          <h2 id="later-heading" className="font-display text-heading font-medium">
            To do sometime
          </h2>
          <p className="text-small text-ink-muted">{later.length}</p>
        </div>
        {later.length === 0 ? (
          <div className="rounded-surface bg-surface p-5">
            <p className="text-ink-secondary">No one-time tasks waiting. Add errands and to-dos here, like making a return.</p>
            <Link
              href="/tasks/new"
              className="mt-4 inline-flex min-h-11 items-center rounded-control bg-action px-5 text-small font-medium text-action-ink"
            >
              Add a task
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {later.map((task) => (
              <TaskRow
                key={task.id}
                id={task.id}
                title={task.title}
                done={false}
                showDoToday
                detail={task.due_date ? `Due ${formatShortDate(task.due_date, today)}` : "No date"}
                tags={task.category ? [task.category] : []}
                editHref={`/tasks/${task.id}?from=/backlog`}
              />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="repeating-heading" className="mt-10">
        <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
          <h2 id="repeating-heading" className="font-display text-heading font-medium">
            Repeating
          </h2>
          <p className="text-small text-ink-muted">{repeating.length}</p>
        </div>
        {repeating.length === 0 ? (
          <div className="rounded-surface bg-surface p-5">
            <p className="text-ink-secondary">
              No routines yet. Add daily or weekly things like taking medicine, laundry or the trash.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {repeating.map((task) => (
              <TaskRow
                key={task.id}
                id={task.id}
                title={task.title}
                detail={`${describeRepeat(task)} · ${TIME_OF_DAY_LABELS[task.time_of_day]}`}
                tags={task.category ? [task.category] : []}
                editHref={`/tasks/${task.id}?from=/backlog`}
              />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
