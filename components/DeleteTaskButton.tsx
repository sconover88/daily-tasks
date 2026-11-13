"use client";

import { useRef, useState, useTransition } from "react";
import { deleteTaskAction } from "@/app/actions";

/** Two-step delete: ask, then confirm. No browser pop-up. */
export default function DeleteTaskButton({ id, returnTo }: { id: string; returnTo: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);

  if (!confirming) {
    return (
      <button
        ref={deleteRef}
        type="button"
        onClick={() => {
          setConfirming(true);
          requestAnimationFrame(() => confirmRef.current?.focus());
        }}
        className="inline-flex min-h-11 items-center rounded-control px-4 text-small font-semibold text-danger underline-offset-4 hover:underline"
      >
        Delete task
      </button>
    );
  }

  return (
    <div role="group" aria-labelledby="delete-question" className="rounded-surface bg-surface p-4">
      <p id="delete-question" className="text-ink">
        Delete this task and its history? This can&apos;t be undone.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          ref={confirmRef}
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const result = await deleteTaskAction(id, returnTo);
              if (result && !result.ok) setError(result.error);
            })
          }
          className="inline-flex min-h-11 items-center rounded-control bg-danger px-5 text-small font-semibold text-inverse-ink disabled:opacity-60"
        >
          {pending ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            requestAnimationFrame(() => deleteRef.current?.focus());
          }}
          className="inline-flex min-h-11 items-center rounded-control border border-edge bg-ground px-5 text-small font-medium text-ink"
        >
          Cancel
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-small font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
