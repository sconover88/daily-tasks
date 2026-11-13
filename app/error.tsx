"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section role="alert" className="rounded-surface bg-surface p-5">
      <h1 className="font-display text-heading font-medium text-ink">Something went wrong</h1>
      <p className="mt-2 text-ink-secondary">
        The app couldn&apos;t reach your task list. Check your connection and try again. If it keeps happening, check the
        Supabase settings in SUPABASE_SETUP.md.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 inline-flex min-h-11 items-center rounded-control bg-action px-5 text-small font-medium text-action-ink"
      >
        Try again
      </button>
    </section>
  );
}
