export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <p className="sr-only">Loading…</p>
      <div aria-hidden="true" className="animate-pulse motion-reduce:animate-none">
        <div className="h-4 w-28 rounded-control bg-surface" />
        <div className="mt-3 h-9 w-40 rounded-control bg-surface" />
        <div className="mt-6 h-44 rounded-surface bg-surface" />
        <div className="mt-8 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-surface bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}
