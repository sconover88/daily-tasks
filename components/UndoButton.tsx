"use client";

import { useState, useTransition } from "react";
import { setTaskDone } from "@/app/actions";

/** Undo today's check-off from the Done tab. */
export default function UndoButton({ taskId, title }: { taskId: string; title: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="shrink-0 text-right">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await setTaskDone(taskId, false);
            if (!result.ok) setError(result.error);
          })
        }
        className="inline-flex min-h-11 items-center rounded-control border border-edge bg-ground px-4 text-small font-medium text-ink transition-colors hover:border-ink disabled:opacity-60"
      >
        {pending ? "Undoing…" : "Undo"}
        <span className="sr-only"> {title}</span>
      </button>
      {error ? (
        <p role="alert" className="mt-1 text-label font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
