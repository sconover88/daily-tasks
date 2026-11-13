import { notFound } from "next/navigation";
import { connection } from "next/server";
import { z } from "zod";
import BackLink from "@/components/BackLink";
import DeleteTaskButton from "@/components/DeleteTaskButton";
import PageHeader from "@/components/PageHeader";
import SetupNotice from "@/components/SetupNotice";
import TaskForm from "@/components/TaskForm";
import { getToday, isSupabaseConfigured } from "@/lib/config";
import { getTask } from "@/lib/data";
import { safeReturnPath } from "@/lib/navigation";

export const metadata = { title: "Edit task" };

const LABELS: Record<string, string> = { "/": "Today", "/backlog": "Backlog", "/done": "Done" };

export default async function EditTaskPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  await connection();
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const [{ id }, { from }] = await Promise.all([params, searchParams]);
  if (!z.uuid().safeParse(id).success) notFound();

  const task = await getTask(id);
  if (!task) notFound();

  const back = safeReturnPath(from, task.repeat === "none" ? "/backlog" : "/");

  return (
    <>
      <BackLink href={back} label={LABELS[back]} />
      <PageHeader title="Edit task" />
      <TaskForm task={task} today={getToday()} returnTo={back} cancelHref={back} />
      <div className="mt-10">
        <DeleteTaskButton id={task.id} returnTo={back} />
      </div>
    </>
  );
}
