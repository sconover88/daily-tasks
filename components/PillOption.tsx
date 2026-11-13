"use client";

type Props = {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
  /** Full name for screen readers when the visible label is abbreviated. */
  srLabel?: string;
  className?: string;
};

/**
 * A pill toggle built on a real radio/checkbox, so keyboard and screen
 * readers work as usual. The focus ring is drawn on the pill (see globals.css).
 */
export default function PillOption({ type, name, value, checked, onChange, children, srLabel, className = "" }: Props) {
  return (
    <label className={`relative inline-flex cursor-pointer ${className}`}>
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="pill-input sr-only"
      />
      <span
        className={`pill flex min-h-11 w-full select-none items-center justify-center rounded-control border px-4 text-small font-medium transition-colors ${
          checked ? "border-action bg-action text-action-ink" : "border-edge bg-ground text-ink hover:border-ink"
        }`}
      >
        {srLabel ? (
          <>
            <span aria-hidden="true">{children}</span>
            <span className="sr-only">{srLabel}</span>
          </>
        ) : (
          children
        )}
      </span>
    </label>
  );
}
