import Link from "next/link";
import { ArrowLeftIcon } from "./icons";

export default function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="-ml-3 mb-2 inline-flex min-h-11 items-center gap-1 rounded-control px-3 text-small font-medium text-ink-secondary hover:text-ink"
    >
      <ArrowLeftIcon size={18} />
      {label}
    </Link>
  );
}
