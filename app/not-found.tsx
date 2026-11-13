import Link from "next/link";

export default function NotFound() {
  return (
    <section className="rounded-surface bg-surface p-5">
      <h1 className="font-display text-heading font-medium text-ink">Not found</h1>
      <p className="mt-2 text-ink-secondary">That task or page doesn&apos;t exist. It may have been deleted.</p>
      <Link
        href="/"
        className="mt-4 inline-flex min-h-11 items-center rounded-control bg-action px-5 text-small font-medium text-action-ink"
      >
        Back to Today
      </Link>
    </section>
  );
}
