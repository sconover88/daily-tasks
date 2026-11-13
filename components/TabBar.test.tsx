import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TabBar from "./TabBar";

const pathname = vi.hoisted(() => ({ value: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.value }));

describe("TabBar", () => {
  it("shows three labelled tabs and an add button", () => {
    render(<TabBar />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Today" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Backlog" })).toHaveAttribute("href", "/backlog");
    expect(screen.getByRole("link", { name: "Done" })).toHaveAttribute("href", "/done");
    expect(screen.getByRole("link", { name: "Add task" })).toHaveAttribute("href", "/tasks/new");
  });

  it("marks only the current tab", () => {
    pathname.value = "/backlog";
    render(<TabBar />);
    expect(screen.getByRole("link", { name: "Backlog" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Today" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Done" })).not.toHaveAttribute("aria-current");
  });
});
