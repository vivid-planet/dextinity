import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AiAssistantSwitch } from "../../aiAssistantSwitch/AiAssistantSwitch";
import { type KeyboardShortcutPlatform, KeyboardShortcutProvider } from "../../keyboardShortcut/keyboardShortcutPlatform";
import { SideNav, type SideNavGroup } from "../../sideNav/SideNav";
import { TopBar } from "../../topBar/TopBar";
import { AppShell, type AppShellEnvironment } from "../AppShell";

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
    environment,
    disableKeyboardShortcuts = false,
}: {
    navCollapsed?: boolean;
    onNavCollapsedChange?: () => void;
    platform?: KeyboardShortcutPlatform;
    withAssistant?: boolean;
    assistantOpen?: boolean;
    onAssistantOpenChange?: (open: boolean) => void;
    environment?: AppShellEnvironment;
    disableKeyboardShortcuts?: boolean;
} = {}) {
    return render(
        <KeyboardShortcutProvider platform={platform}>
            <AppShell
                nav={<SideNav title="App" groups={groups} currentId="jobs" expandedIds={[]} onExpandedIdsChange={vi.fn()} onNavigate={vi.fn()} />}
                topBar={<TopBar assistantSwitch={withAssistant ? <AiAssistantSwitch /> : undefined} />}
                navCollapsed={navCollapsed}
                disableKeyboardShortcuts={disableKeyboardShortcuts}
                onNavCollapsedChange={onNavCollapsedChange}
                assistant={withAssistant ? <textarea aria-label="Message" /> : undefined}
                assistantOpen={assistantOpen}
                onAssistantOpenChange={onAssistantOpenChange}
                environment={environment}
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

    it("collapses the navigation on medium windows and expands it over the content, apart from the user setting", () => {
        windowWidth = 1000;
        const onNavCollapsedChange = vi.fn();
        const { container } = renderShell({ onNavCollapsedChange });
        const root = container.querySelector<HTMLElement>(".dextinityAppShell");

        expect(root?.dataset.layout).toBe("medium");
        expect(screen.getByRole("navigation").hasAttribute("data-collapsed")).toBe(true);
        fireEvent.keyDown(document, { key: "\\", ctrlKey: true });
        expect(screen.getByRole("navigation").hasAttribute("data-collapsed")).toBe(false);
        expect(root?.hasAttribute("data-navoverlay")).toBe(true);
        expect(onNavCollapsedChange).not.toHaveBeenCalled();
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.getByRole("navigation").hasAttribute("data-collapsed")).toBe(true);
    });

    it("moves the focus to the expand button when Escape collapses the navigation over the content", () => {
        windowWidth = 1000;
        renderShell();

        fireEvent.keyDown(document, { key: "\\", ctrlKey: true });
        screen.getByRole("link", { name: "Job ads" }).focus();
        fireEvent.keyDown(document.activeElement ?? document, { key: "Escape" });
        expect(document.activeElement).toBe(screen.getByRole("button", { name: "Expand" }));
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

    it("focuses an assistant without a text field as a whole, so Escape still closes it and returns focus to the switch", () => {
        vi.useFakeTimers();
        windowWidth = 1440;
        const renderShellElement = (assistantOpen: boolean, onAssistantOpenChange = vi.fn()) => (
            <AppShell
                nav={<span />}
                topBar={<TopBar assistantSwitch={<AiAssistantSwitch />} />}
                navCollapsed={false}
                onNavCollapsedChange={vi.fn()}
                assistant={<p>Loading</p>}
                assistantOpen={assistantOpen}
                onAssistantOpenChange={onAssistantOpenChange}
            >
                Content
            </AppShell>
        );
        const onAssistantOpenChange = vi.fn();
        const { rerender } = render(renderShellElement(true, onAssistantOpenChange));
        act(() => vi.runAllTimers());
        vi.useRealTimers();

        const focused = document.activeElement as HTMLElement;
        expect(focused.textContent).toBe("Loading");
        fireEvent.keyDown(focused, { key: "Escape" });
        expect(onAssistantOpenChange).toHaveBeenLastCalledWith(false);

        rerender(renderShellElement(false));
        expect(document.activeElement).toBe(screen.getByRole("switch", { name: "AI assistant" }));
    });

    it("names the assistant's shortcut on the switch only while the shell listens to it", () => {
        windowWidth = 1440;
        const { unmount } = renderShell({ withAssistant: true });
        expect(screen.getByRole("switch", { name: "AI assistant" }).getAttribute("aria-keyshortcuts")).toBe("Control+J");
        unmount();

        renderShell({ withAssistant: true, disableKeyboardShortcuts: true });
        expect(screen.getByRole("switch", { name: "AI assistant" }).hasAttribute("aria-keyshortcuts")).toBe(false);
    });

    it("leaves out the assistant's shortcut without an assistant", () => {
        windowWidth = 1440;
        const onAssistantOpenChange = vi.fn();
        renderShell({ onAssistantOpenChange });

        fireEvent.keyDown(document, { key: "j", ctrlKey: true });
        expect(onAssistantOpenChange).not.toHaveBeenCalled();
        expect(screen.queryByRole("switch")).toBeNull();
    });

    it("marks another instance than the live system with a line along the top edge and its label in the navigation", () => {
        windowWidth = 1440;
        const { container } = renderShell({ environment: { label: "Staging", color: "error" } });

        const shell = container.querySelector<HTMLElement>(".dextinityAppShell");
        const edge = container.querySelector<HTMLElement>(".dextinityAppShell__environmentEdge");
        expect([shell?.hasAttribute("data-environment"), edge?.dataset.color, edge?.getAttribute("aria-hidden")]).toStrictEqual([
            true,
            "error",
            "true",
        ]);
        expect(screen.getByRole("navigation", { name: "Main navigation" }).textContent).toContain("Staging");
        expect(screen.getByRole("banner").textContent).not.toContain("Staging");
    });

    it("moves the instance's label into the top bar on narrow windows, where the navigation is a drawer", () => {
        windowWidth = 600;
        renderShell({ environment: { label: "Test", color: "success" } });

        expect(screen.getByRole("banner").textContent).toContain("Test");
    });

    it("marks nothing on the live system", () => {
        windowWidth = 1440;
        const { container } = renderShell();

        expect([container.querySelector(".dextinityAppShell__environmentEdge"), container.querySelector(".dextinityEnvironmentLabel")]).toStrictEqual(
            [null, null],
        );
    });

    it("opens the assistant as a sheet and shows only the switch's icon on narrow windows", () => {
        windowWidth = 600;
        renderShell({ withAssistant: true, assistantOpen: true });

        expect(screen.getByRole("dialog", { name: "AI assistant" })).toBeTruthy();
        // The open sheet is modal, so it hides the rest of the page, the switch included, from assistive technology
        expect(screen.getByRole("switch", { name: "AI assistant", hidden: true }).hasAttribute("data-icononly")).toBe(true);
    });

    it("keeps the assistant's state when the window crosses the narrow breakpoint", () => {
        windowWidth = 1440;
        function StatefulAssistant() {
            const [draft, setDraft] = useState("");
            return <textarea aria-label="Message" value={draft} onChange={(event) => setDraft(event.target.value)} />;
        }
        const renderShellElement = () => (
            <AppShell
                nav={<span />}
                topBar={<TopBar />}
                navCollapsed={false}
                onNavCollapsedChange={vi.fn()}
                assistant={<StatefulAssistant />}
                assistantOpen
            >
                Content
            </AppShell>
        );
        const { rerender } = render(renderShellElement());
        fireEvent.change(screen.getByRole("textbox", { name: "Message" }), { target: { value: "Which job ads have no salary?" } });

        windowWidth = 600;
        rerender(renderShellElement());
        const sheet = screen.getByRole("dialog", { name: "AI assistant" });
        expect(sheet.querySelector("textarea")?.value).toBe("Which job ads have no salary?");
    });
});
