import { act, cleanup, render, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KeyboardShortcut } from "../KeyboardShortcut";
import { KeyboardShortcutProvider } from "../keyboardShortcutPlatform";

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

function mockPlatform(platform: string) {
    vi.spyOn(navigator, "platform", "get").mockReturnValue(platform);
}

function keyCaps(element: Element | null | undefined) {
    return element?.querySelector("[aria-hidden]")?.textContent;
}

describe("KeyboardShortcut", () => {
    it("renders a kbd element with the contract class merged with the consumer class", () => {
        render(<KeyboardShortcut className="consumer-class">⌘K</KeyboardShortcut>);

        const key = screen.getByText("⌘K");
        expect(key.tagName).toBe("KBD");
        expect(key.className).toContain("dextinityKeyboardShortcut");
        expect(key.className).toContain("consumer-class");
    });

    it("shows ⌘ and speaks Command on Apple platforms", () => {
        mockPlatform("MacIntel");
        const { container } = render(<KeyboardShortcut shortcut="shift+mod+n" />);

        const shortcut = container.querySelector("kbd");
        expect(keyCaps(shortcut)).toBe("⇧⌘N");
        expect(shortcut?.querySelectorAll("[aria-hidden] kbd")).toHaveLength(3);
        expect(screen.getByText("Shift Command N")).toBeInTheDocument();
        expect(shortcut?.dataset.platform).toBe("apple");
    });

    it("shows Ctrl and speaks Control on other platforms", () => {
        mockPlatform("Win32");
        const { container } = render(<KeyboardShortcut shortcut="shift+mod+n" />);

        const shortcut = container.querySelector("kbd");
        expect(keyCaps(shortcut)).toBe("Ctrl+Shift+N");
        expect(screen.getByText("Control Shift N")).toBeInTheDocument();
        expect(shortcut?.dataset.platform).toBe("other");
    });

    it("takes the platform from the prop over the provider over the detected one", () => {
        mockPlatform("Win32");
        const { container } = render(
            <KeyboardShortcutProvider platform="apple">
                <KeyboardShortcut shortcut="mod+k" />
                <KeyboardShortcut shortcut="mod+k" platform="other" />
            </KeyboardShortcutProvider>,
        );

        const [fromProvider, fromProp] = container.querySelectorAll(":scope > kbd");
        expect(keyCaps(fromProvider)).toBe("⌘K");
        expect(keyCaps(fromProp)).toBe("Ctrl+K");
    });

    it("names the keys from labels, merged with the provider's labels", () => {
        render(
            <KeyboardShortcutProvider platform="other" labels={{ control: "Steuerung", shift: "Umschalt" }}>
                <KeyboardShortcut shortcut="shift+mod+Escape" labels={{ escape: "Abbrechen" }} />
            </KeyboardShortcutProvider>,
        );

        expect(screen.getByText("Steuerung Umschalt Abbrechen")).toBeInTheDocument();
    });

    it("shows children without a shortcut", () => {
        render(<KeyboardShortcut platform="apple">Right-click</KeyboardShortcut>);

        expect(screen.getByText("Right-click").tagName).toBe("KBD");
    });

    it("hydrates server-rendered markup without a mismatch and shows the detected platform afterwards", async () => {
        mockPlatform("MacIntel");
        const element = <KeyboardShortcut shortcut="mod+k" />;
        const container = document.createElement("div");
        container.innerHTML = renderToString(element);
        document.body.append(container);
        expect(keyCaps(container)).toBe("Ctrl+K");

        const onRecoverableError = vi.fn();
        await act(async () => {
            hydrateRoot(container, element, { onRecoverableError });
        });

        expect(onRecoverableError).not.toHaveBeenCalled();
        expect(keyCaps(container)).toBe("⌘K");
        container.remove();
    });
});
