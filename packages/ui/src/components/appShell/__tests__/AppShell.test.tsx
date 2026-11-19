import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AiAssistantSwitch } from "../../aiAssistantSwitch/AiAssistantSwitch";
import { type KeyboardShortcutPlatform, KeyboardShortcutProvider } from "../../keyboardShortcut/keyboardShortcutPlatform";
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

function renderShell({
    navCollapsed = false,
    onNavCollapsedChange = vi.fn(),
    platform = "other",
    withAssistant = false,
    assistantOpen = false,
    onAssistantOpenChange = vi.fn(),
}: {
    navCollapsed?: boolean;
    onNavCollapsedChange?: () => void;
    platform?: KeyboardShortcutPlatform;
    withAssistant?: boolean;
    assistantOpen?: boolean;
    onAssistantOpenChange?: (open: boolean) => void;
} = {}) {
    return render(
        <KeyboardShortcutProvider platform={platform}>
            <AppShell
                nav={<SideNav title="App" groups={groups} currentId="jobs" expandedIds={[]} onExpandedIdsChange={vi.fn()} onNavigate={vi.fn()} />}
                topBar={<TopBar assistantSwitch={withAssistant ? <AiAssistantSwitch /> : undefined} />}
                navCollapsed={navCollapsed}
                onNavCollapsedChange={onNavCollapsedChange}
                assistant={withAssistant ? <textarea aria-label="Message" /> : undefined}
                assistantOpen={assistantOpen}
                onAssistantOpenChange={onAssistantOpenChange}
            >
                Content
            </AppShell>
        </KeyboardShortcutProvider>,
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

    it("toggles the navigation with Ctrl+\\ typed with AltGr, as on German Windows keyboards", () => {
        windowWidth = 1440;
        const onNavCollapsedChange = vi.fn();
        renderShell({ onNavCollapsedChange });

        fireEvent.keyDown(document, { key: "\\", ctrlKey: true, altKey: true });
        expect(onNavCollapsedChange).toHaveBeenCalledWith(true);
    });

    it("toggles the navigation with ⌘\\ and not with Ctrl+\\ on Apple platforms", () => {
        windowWidth = 1440;
        const onNavCollapsedChange = vi.fn();
        renderShell({ onNavCollapsedChange, platform: "apple" });

        fireEvent.keyDown(document, { key: "\\", ctrlKey: true });
        expect(onNavCollapsedChange).not.toHaveBeenCalled();
        // ⌥⇧7 types a backslash on German Mac keyboards
        fireEvent.keyDown(document, { key: "\\", metaKey: true, altKey: true, shiftKey: true });
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

    it("gives the assistant a column of its own that is inert while hidden", () => {
        windowWidth = 1440;
        const { container } = renderShell({ withAssistant: true });
        const root = container.querySelector<HTMLElement>(".dextinityAppShell");
        const assistant = screen.getByRole("complementary", { hidden: true });

        expect(root?.hasAttribute("data-assistantopen")).toBe(false);
        expect(assistant.getAttribute("aria-label")).toBe("AI assistant");
        expect(assistant.hasAttribute("inert")).toBe(true);

        cleanup();
        renderShell({ withAssistant: true, assistantOpen: true });
        expect(document.querySelector(".dextinityAppShell")?.hasAttribute("data-assistantopen")).toBe(true);
        expect(screen.getByRole("complementary", { name: "AI assistant" }).hasAttribute("inert")).toBe(false);
    });

    it("lets the switch in the top bar follow the assistant and toggle it", () => {
        windowWidth = 1440;
        const onAssistantOpenChange = vi.fn();
        renderShell({ withAssistant: true, assistantOpen: true, onAssistantOpenChange });

        const assistantSwitch = screen.getByRole("switch", { name: "AI assistant" });
        expect(assistantSwitch.getAttribute("aria-checked")).toBe("true");
        act(() => assistantSwitch.click());
        expect(onAssistantOpenChange).toHaveBeenCalledWith(false);
    });

    it("toggles the assistant with Ctrl+J and closes it with Escape inside it", () => {
        windowWidth = 1440;
        const onAssistantOpenChange = vi.fn();
        renderShell({ withAssistant: true, onAssistantOpenChange });

        fireEvent.keyDown(document, { key: "j", ctrlKey: true });
        expect(onAssistantOpenChange).toHaveBeenLastCalledWith(true);

        cleanup();
        renderShell({ withAssistant: true, assistantOpen: true, onAssistantOpenChange });
        fireEvent.keyDown(screen.getByRole("textbox", { name: "Message" }), { key: "Escape" });
        expect(onAssistantOpenChange).toHaveBeenLastCalledWith(false);
    });

    it("leaves out the assistant's shortcut without an assistant", () => {
        windowWidth = 1440;
        const onAssistantOpenChange = vi.fn();
        renderShell({ onAssistantOpenChange });

        fireEvent.keyDown(document, { key: "j", ctrlKey: true });
        expect(onAssistantOpenChange).not.toHaveBeenCalled();
        expect(screen.queryByRole("switch")).toBeNull();
    });

    it("opens the assistant as a sheet and shows only the switch's icon on narrow windows", () => {
        windowWidth = 600;
        renderShell({ withAssistant: true, assistantOpen: true });

        expect(screen.getByRole("dialog", { name: "AI assistant" })).toBeTruthy();
        // The open sheet is modal, so it hides the rest of the page, the switch included, from assistive technology
        expect(screen.getByRole("switch", { name: "AI assistant", hidden: true }).hasAttribute("data-icononly")).toBe(true);
    });
});
