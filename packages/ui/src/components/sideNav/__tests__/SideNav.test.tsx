import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppShellContext } from "../../appShell/appShellContext";
import { getSideNavAncestorIds, SideNav, type SideNavGroup } from "../SideNav";

const groups: SideNavGroup[] = [
    {
        label: "Content",
        items: [
            { id: "dashboard", label: "Overview", icon: <span />, href: "/" },
            {
                id: "website",
                label: "Website",
                icon: <span />,
                children: [{ id: "careers", label: "Careers", children: [{ id: "jobs", label: "Job ads", href: "/jobs" }] }],
            },
        ],
    },
];

afterEach(cleanup);

describe("getSideNavAncestorIds", () => {
    it("returns the ancestors outermost first, and nothing for a top-level or unknown id", () => {
        expect(getSideNavAncestorIds(groups, "jobs")).toStrictEqual(["website", "careers"]);
        expect(getSideNavAncestorIds(groups, "dashboard")).toStrictEqual([]);
        expect(getSideNavAncestorIds(groups, "missing")).toStrictEqual([]);
    });
});

describe("SideNav render contract", () => {
    it("marks the level, the current entry, and its ancestors", () => {
        render(
            <SideNav
                title="App"
                groups={groups}
                currentId="jobs"
                expandedIds={["website", "careers"]}
                onExpandedIdsChange={vi.fn()}
                onNavigate={vi.fn()}
            />,
        );

        const nav = screen.getByRole("navigation");
        expect(nav.className).toContain("dextinitySideNav");
        expect(nav.hasAttribute("data-collapsed")).toBe(false);
        const jobs = screen.getByRole("link", { name: "Job ads" });
        expect([jobs.dataset.level, jobs.dataset.current, jobs.getAttribute("aria-current")]).toStrictEqual(["3", "", "page"]);
        expect(jobs.className).toContain("dextinitySideNav__item");
        const website = screen.getByRole("button", { name: "Website" });
        expect([website.dataset.level, website.dataset.ancestor]).toStrictEqual(["1", ""]);
    });

    it("keeps closed sub-entries out of the tab order", () => {
        render(<SideNav title="App" groups={groups} currentId="dashboard" expandedIds={[]} onExpandedIdsChange={vi.fn()} onNavigate={vi.fn()} />);

        const website = screen.getByRole("button", { name: "Website" });
        expect(document.getElementById(website.getAttribute("aria-controls") ?? "")?.hasAttribute("inert")).toBe(true);
    });

    it("follows the AppShell's collapsed state and collapse handler when its own props are unset", () => {
        const onNavCollapsedChange = vi.fn();
        render(
            <AppShellContext.Provider value={{ navCollapsed: true, onNavCollapsedChange }}>
                <SideNav title="App" groups={groups} currentId="dashboard" expandedIds={[]} onExpandedIdsChange={vi.fn()} onNavigate={vi.fn()} />
            </AppShellContext.Provider>,
        );

        expect(screen.getByRole("navigation").hasAttribute("data-collapsed")).toBe(true);
        screen.getByRole("button", { name: "Expand" }).click();
        expect(onNavCollapsedChange).toHaveBeenCalledWith(false);
    });

    it("announces the AppShell's collapse shortcut on the collapse button", () => {
        render(
            <AppShellContext.Provider value={{ navCollapsed: false, onNavCollapsedChange: vi.fn(), navCollapseKeyboardShortcut: "mod+\\" }}>
                <SideNav groups={groups} currentId="dashboard" expandedIds={[]} onExpandedIdsChange={vi.fn()} onNavigate={vi.fn()} />
            </AppShellContext.Provider>,
        );

        expect(screen.getByRole("button", { name: "Collapse" }).getAttribute("aria-keyshortcuts")).toBe("Control+\\");
    });
});
