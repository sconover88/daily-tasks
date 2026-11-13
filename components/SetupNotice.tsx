import PageHeader from "./PageHeader";

/** Shown instead of a page until Supabase keys are added. */
export default function SetupNotice() {
  return (
    <>
      <PageHeader title="Almost ready" eyebrow="Setup" />
      <section className="rounded-surface bg-surface p-5">
        <h2 className="font-display text-heading font-medium">Connect your database</h2>
        <p className="mt-2 text-ink-secondary">
          The app can&apos;t find its Supabase keys yet. Follow <strong className="font-semibold text-ink">SUPABASE_SETUP.md</strong>{" "}
          in the project, then add these settings:
        </p>
        <ul className="mt-4 space-y-2 text-small">
          {["SUPABASE_URL", "SUPABASE_SECRET_KEY", "APP_TIME_ZONE"].map((key) => (
            <li key={key}>
              <code className="rounded-control bg-ground px-3 py-1 font-mono text-ink">{key}</code>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-small text-ink-secondary">
          On your computer they go in a file named <code className="font-mono text-ink">.env.local</code>. On Vercel they go in
          Project Settings, Environment Variables. Then redeploy.
        </p>
      </section>
    </>
  );
}
