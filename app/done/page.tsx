import { connection } from "next/server";
import PageHeader from "@/components/PageHeader";
import SetupNotice from "@/components/SetupNotice";
import Tag from "@/components/Tag";
import UndoButton from "@/components/UndoButton";
import { CheckIcon } from "@/components/icons";
import { getTimeZone, getToday, isSupabaseConfigured } from "@/lib/config";
import { listCompletionsSince, type CompletionWithTask } from "@/lib/data";
import { addDays, relativeDayLabel } from "@/lib/dates";

export const metadata = { title: "Done" };

const DAYS = 30;

export default async function DonePage() {
  await connection();
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const today = getToday();
  const timeZone = getTimeZone();
  const completions = await listCompletionsSince(addDays(today, -(DAYS - 1)));

  const byDay = new Map<string, CompletionWithTask[]>();
  for (const c of completions) {
    const list = byDay.get(c.completed_on) ?? [];
    list.push(c);
    byDay.set(c.completed_on, list);
  }
  const days = [...byDay.keys()].sort().reverse();

  const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone });

  return (
    <>
      <PageHeader title="Done" eyebrow={`Last ${DAYS} days`}>
        {completions.length === 0
          ? "Nothing checked off yet."
          : `${completions.length} ${completions.length === 1 ? "task" : "tasks"} done on ${days.length} of the last ${DAYS} days.`}
      </PageHeader>

      {days.length === 0 ? (
        <div className="rounded-surface bg-surface p-5">
          <p className="text-ink-secondary">When you check something off, it shows up here, grouped by day.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {days.map((day) => {
            const list = byDay.get(day) ?? [];
            const headingId = `day-${day}`;
            return (
              <section key={day} aria-labelledby={headingId}>
                <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
                  <h2 id={headingId} className="font-display text-heading font-medium">
                    {relativeDayLabel(day, today)}
                  </h2>
                  <p className="text-small text-ink-muted">{list.length} done</p>
                </div>
                <ul className="space-y-2">
                  {list.map((c) => {
                    const title = c.task?.title ?? "Deleted task";
                    return (
                      <li key={c.id} className="flex items-center gap-3 rounded-surface bg-surface p-2 pr-2">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-control bg-action text-action-ink">
                          <CheckIcon size={18} />
                        </span>
                        <div className="min-w-0 flex-1 py-1.5">
                          <p className="break-words text-ink">{title}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                            <span className="text-label text-ink-muted">
                              <time dateTime={c.completed_at}>{timeFormat.format(new Date(c.completed_at))}</time>
                            </span>
                            {c.task?.category ? <Tag>{c.task.category}</Tag> : null}
                          </div>
                        </div>
                        {day === today && c.task ? <UndoButton taskId={c.task_id} title={title} /> : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
