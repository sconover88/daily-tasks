import { connection } from "next/server";
import BackLink from "@/components/BackLink";
import PageHeader from "@/components/PageHeader";
import SetupNotice from "@/components/SetupNotice";
import TaskForm from "@/components/TaskForm";
import { getToday, isSupabaseConfigured } from "@/lib/config";
import { safeReturnPath } from "@/lib/navigation";

export const metadata = { title: "Add task" };

const LABELS: Record<string, string> = { "/": "Today", "/backlog": "Backlog", "/done": "Done" };

export default async function NewTaskPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  await connection();
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const { from } = await searchParams;
  const returnTo = safeReturnPath(from);
  const back = returnTo || "/";

  return (
    <>
      <BackLink href={back} label={LABELS[back]} />
      <PageHeader title="Add task">Something to do once, or a routine that repeats.</PageHeader>
      <TaskForm today={getToday()} returnTo={returnTo} cancelHref={back} />
    </>
  );
}
