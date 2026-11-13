"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const TABS = [
  { href: "/", label: "Today" },
  { href: "/backlog", label: "Backlog" },
  { href: "/done", label: "Done" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Floating bottom navigation: three pill tabs plus the add button, in thumb reach. */
export default function TabBar() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 px-[var(--page-margin)] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex max-w-xl items-center gap-2">
        <ul className="flex flex-1 items-center gap-1 rounded-control bg-surface p-1 shadow-[0_8px_24px_-12px_rgba(20,19,20,0.35)]">
          {TABS.map((tab) => {
            const active = isActive(pathname, tab.href);
            return (
              <li key={tab.href} className="flex-1">
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-12 items-center justify-center rounded-control px-3 text-small font-medium transition-colors ${
                    active ? "bg-action text-action-ink" : "text-ink-secondary hover:text-ink"
                  }`}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <Link
          href="/tasks/new"
          aria-label="Add task"
          aria-current={pathname === "/tasks/new" ? "page" : undefined}
          className="flex size-14 shrink-0 items-center justify-center rounded-control bg-action text-action-ink shadow-[0_8px_24px_-12px_rgba(20,19,20,0.6)] transition-transform active:scale-95"
        >
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Link>
      </div>
    </nav>
  );
}
