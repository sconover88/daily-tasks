/** A small, quiet label (category, schedule). Not interactive. */
export default function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-control bg-ground px-2.5 py-0.5 text-label font-medium text-ink-secondary">
      {children}
    </span>
  );
}
