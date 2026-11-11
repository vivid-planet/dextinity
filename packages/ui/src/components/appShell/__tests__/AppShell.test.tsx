import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SideNav, type SideNavGroup } from "../../sideNav/SideNav";
import { TopBar } from "../../topBar/TopBar";
import { AppShell } from "../AppShell";

const groups: SideNavGroup[] = [{ label: "Content", items: [{ id: "jobs", label: "Job ads", icon: <span />, href: "#jobs" }] }];

let windowWidth = 1440;

function matchMedia(query: string) {
    const [, operator, value] = /\(width ([<>]=?) (\d+)px\)/.exec(query) ?? [];
    const width = Number(value);
    const matches = operator === "<" ? windowWidth < width : windowWidth >= width;
    return { matches, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as MediaQueryList;
}

function renderShell({ navCollapsed = false, onNavCollapsedChange = vi.fn() } = {}) {
    return render(
        <AppShell
            nav={<SideNav title="App" groups={groups} activeId="jobs" expanded={[]} onExpandedChange={vi.fn()} onNavigate={vi.fn()} />}
            topBar={<TopBar />}
            navCollapsed={navCollapsed}
            onNavCollapsedChange={onNavCollapsedChange}
        >
            Content
        </AppShell>,
    );
}

beforeEach(() => {
    vi.stubGlobal("matchMedia", matchMedia);
});

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe("AppShell", () => {
    it("emits the layout and lets the navigation follow its collapsed state", () => {
        windowWidth = 1440;
        const { container } = renderShell({ navCollapsed: true });

        const root = container.querySelector<HTMLElement>(".dextinityAppShell");
        expect([root?.dataset.layout, root?.dataset.navcollapsed]).toStrictEqual(["wide", ""]);
        expect(screen.getByRole("navigation").hasAttribute("data-collapsed")).toBe(true);
    });

    it("collapses the navigation on medium windows and toggles it with Ctrl+\\ only on wide ones", () => {
        windowWidth = 1000;
        const onNavCollapsedChange = vi.fn();
        const { container } = renderShell({ onNavCollapsedChange });

        expect(container.querySelector<HTMLElement>(".dextinityAppShell")?.dataset.layout).toBe("medium");
        expect(screen.getByRole("navigation").hasAttribute("data-collapsed")).toBe(true);
        fireEvent.keyDown(document, { key: "\\", ctrlKey: true });
        expect(onNavCollapsedChange).not.toHaveBeenCalled();
    });

    it("toggles the navigation with Ctrl+\\ on wide windows", () => {
        windowWidth = 1440;
        const onNavCollapsedChange = vi.fn();
        renderShell({ onNavCollapsedChange });

        fireEvent.keyDown(document, { key: "\\", ctrlKey: true });
        expect(onNavCollapsedChange).toHaveBeenCalledWith(true);
    });

    it("moves the navigation into a drawer behind the top bar's menu button on narrow windows", () => {
        windowWidth = 600;
        renderShell();

        expect(screen.queryByRole("navigation")).toBeNull();
        // jsdom's viewport is always 1024px wide, so the stylesheet hides the menu button that only narrow windows show
        act(() => screen.getByLabelText("Open navigation").click());
        expect(screen.getByRole("dialog", { name: "Navigation" })).toBeTruthy();
        expect(screen.getByRole("navigation").hasAttribute("data-collapsed")).toBe(false);
    });
});
