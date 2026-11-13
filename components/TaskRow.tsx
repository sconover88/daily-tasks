"use client";

import Link from "next/link";
import { useId, useOptimistic, useState, useTransition } from "react";
import { doToday, setTaskDone } from "@/app/actions";
import { CheckIcon, EditIcon } from "./icons";
import Tag from "./Tag";

export type TaskRowProps = {
  id: string;
  title: string;
  /** Short facts shown under the title, e.g. "Daily", "Health". */
  tags?: string[];
  /** A warning line, e.g. "Overdue since Nov 10". Shown in the error colour. */
  warning?: string;
  /** Plain context line, e.g. "Due Nov 20". */
  detail?: string;
  /** Show a checkbox. Omit for rows that only open the editor. */
  done?: boolean;
  showDoToday?: boolean;
  editHref: string;
};

/** One task as an inset card: checkbox, title and facts, edit button. */
export default function TaskRow({ id, title, tags = [], warning, detail, done, showDoToday, editHref }: TaskRowProps) {
  const titleId = useId();
  const errorId = useId();
  const [optimisticDone, setOptimisticDone] = useOptimistic(done ?? false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const checkable = done !== undefined;

  function toggle() {
    const next = !optimisticDone;
    setError(null);
    startTransition(async () => {
      setOptimisticDone(next);
      const result = await setTaskDone(id, next);
      if (!result.ok) setError(result.error);
    });
  }

  function moveToToday() {
    setError(null);
    startTransition(async () => {
      const result = await doToday(id);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <li className="flex items-start gap-3 rounded-surface bg-surface p-2 pr-1">
      {checkable ? (
        <button
          type="button"
          role="checkbox"
          aria-checked={optimisticDone}
          aria-labelledby={titleId}
          aria-describedby={error ? errorId : undefined}
          onClick={toggle}
          className={`flex size-11 shrink-0 items-center justify-center rounded-control border-2 transition-colors ${
            optimisticDone ? "border-action bg-action text-action-ink" : "border-edge bg-ground text-transparent hover:border-ink-muted"
          }`}
        >
          <CheckIcon size={20} />
        </button>
      ) : null}

      <div className={`min-w-0 flex-1 py-2.5 ${checkable ? "" : "pl-3"}`}>
        <p
          id={titleId}
          className={`break-words text-body leading-snug ${optimisticDone ? "text-ink-muted line-through decoration-1" : "text-ink"}`}
        >
          {title}
        </p>
        {tags.length > 0 || warning || detail ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            {warning ? <span className="text-label font-semibold text-danger">{warning}</span> : null}
            {detail ? <span className="text-label text-ink-muted">{detail}</span> : null}
            {tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        ) : null}
        {showDoToday ? (
          <button
            type="button"
            onClick={moveToToday}
            disabled={pending}
            className="mt-3 inline-flex min-h-11 items-center rounded-control border border-edge bg-ground px-4 text-small font-medium text-ink transition-colors hover:border-ink disabled:opacity-60"
          >
            {pending ? "Moving…" : "Do today"}
          </button>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="mt-2 text-small font-medium text-danger">
            {error}
          </p>
        ) : null}
      </div>

      <Link
        href={editHref}
        className="flex size-11 shrink-0 items-center justify-center rounded-control text-ink-muted transition-colors hover:bg-ground hover:text-ink"
      >
        <EditIcon />
        <span className="sr-only">Edit {title}</span>
      </Link>
    </li>
  );
}
