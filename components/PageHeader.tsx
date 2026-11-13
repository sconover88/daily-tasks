type Props = {
  title: string;
  eyebrow?: string;
  children?: React.ReactNode;
};

/** Page title block: a small line of context above a Host Grotesk title. */
export default function PageHeader({ title, eyebrow, children }: Props) {
  return (
    <header className="mb-6">
      {eyebrow ? <p className="text-small font-medium text-ink-muted">{eyebrow}</p> : null}
      <h1 className="mt-1 font-display text-title font-medium tracking-[-0.02em] text-ink">{title}</h1>
      {children ? <div className="mt-2 text-body text-ink-secondary">{children}</div> : null}
    </header>
  );
}
