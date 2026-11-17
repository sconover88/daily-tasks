import Link from "next/link";
import { connection } from "next/server";
import PageHeader from "@/components/PageHeader";
import SetupNotice from "@/components/SetupNotice";
import StreakPanel from "@/components/StreakPanel";
import TodayGroups from "@/components/TodayGroups";
import WeeklySection from "@/components/WeeklySection";
import { getToday, isSupabaseConfigured } from "@/lib/config";
import { listCompletionDates, listCompletionsFrom, listOpenAndRecentTasks } from "@/lib/data";
import { addDays, formatLongDate, weekStart } from "@/lib/dates";
import { buildTodayItems, buildWeeklyItems } from "@/lib/recurrence";
import { computeStreak } from "@/lib/streak";

export const metadata = { title: "Today" };

export default async function TodayPage() {
  await connection();
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const today = getToday();
  const [tasks, completionsThisWeek, completionDates] = await Promise.all([
    // Anything finished since yesterday (UTC) covers "finished today" in any US zone.
    listOpenAndRecentTasks(addDays(today, -1)),
    listCompletionsFrom(weekStart(today)),
    listCompletionDates(),
  ]);

  const doneIds = new Set(completionsThisWeek.filter((c) => c.completed_on === today).map((c) => c.task_id));
  const items = buildTodayItems(tasks, doneIds, today);
  const weekly = buildWeeklyItems(tasks, completionsThisWeek, today);
  const streak = computeStreak(completionDates, today);
  const remaining = items.filter((i) => !i.done).length;

  return (
    <>
      <PageHeader title="Today" eyebrow={formatLongDate(today)} />

      <StreakPanel {...streak} />

      <div className="mt-8 space-y-8">
        {items.length === 0 && weekly.length === 0 ? (
          <section className="rounded-surface bg-surface p-5">
            <h2 className="font-display text-heading font-medium">Nothing on today&apos;s list</h2>
            <p className="mt-2 text-ink-secondary">Add something new, or pull a task in from your backlog.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/tasks/new"
                className="inline-flex min-h-11 items-center rounded-control bg-action px-5 text-small font-medium text-action-ink"
              >
                Add a task
              </Link>
              <Link
                href="/backlog"
                className="inline-flex min-h-11 items-center rounded-control border border-edge bg-ground px-5 text-small font-medium text-ink"
              >
                Open backlog
              </Link>
            </div>
          </section>
        ) : items.length > 0 ? (
          <div>
            {remaining === 0 ? (
              <p className="mb-6 rounded-surface bg-surface px-5 py-4 text-ink-secondary">
                Everything on today&apos;s list is done.{" "}
                <Link href="/backlog" className="font-medium text-ink underline">
                  Pick something from the backlog
                </Link>{" "}
                if you feel like more.
              </p>
            ) : null}
            <TodayGroups items={items} today={today} />
          </div>
        ) : null}
        <WeeklySection items={weekly} />
      </div>
    </>
  );
}
