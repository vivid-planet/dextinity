import { cleanup, fireEvent, render, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { describeShortcut, formatShortcut } from "../formatShortcut";
import { KeyboardShortcutProvider } from "../keyboardShortcutPlatform";
import { matchesShortcut, useKeyboardShortcut } from "../useKeyboardShortcut";

afterEach(cleanup);

const noModifiers = { metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };

describe("matchesShortcut", () => {
    it("treats mod as ⌘ on Apple platforms and as Ctrl elsewhere", () => {
        expect(matchesShortcut({ ...noModifiers, key: "s", metaKey: true }, "mod+s", true)).toBe(true);
        expect(matchesShortcut({ ...noModifiers, key: "s", ctrlKey: true }, "mod+s", true)).toBe(false);
        expect(matchesShortcut({ ...noModifiers, key: "s", ctrlKey: true }, "mod+s", false)).toBe(true);
    });

    it("requires exactly the given modifiers for letters", () => {
        expect(matchesShortcut({ ...noModifiers, key: "N", metaKey: true, shiftKey: true }, "shift+mod+n", true)).toBe(true);
        expect(matchesShortcut({ ...noModifiers, key: "n", metaKey: true }, "shift+mod+n", true)).toBe(false);
        expect(matchesShortcut({ ...noModifiers, key: "s", metaKey: true, shiftKey: true }, "mod+s", true)).toBe(false);
    });

    it("ignores shift for symbols", () => {
        expect(matchesShortcut({ ...noModifiers, key: "?", shiftKey: true }, "?", true)).toBe(true);
    });
});

describe("formatShortcut", () => {
    it("returns the platform's key caps", () => {
        expect(formatShortcut("shift+mod+n", true)).toEqual(["⇧", "⌘", "N"]);
        expect(formatShortcut("mod+s", false)).toEqual(["Ctrl", "S"]);
        expect(formatShortcut("Escape", true)).toEqual(["Esc"]);
    });

    it("puts the modifiers in the platform's order", () => {
        expect(formatShortcut("mod+shift+alt+n", true)).toEqual(["⌥", "⇧", "⌘", "N"]);
        expect(formatShortcut("alt+shift+mod+n", false)).toEqual(["Ctrl", "Shift", "Alt", "N"]);
    });
});

describe("describeShortcut", () => {
    it("returns the spoken name for the platform", () => {
        expect(describeShortcut("shift+mod+n", true)).toBe("Shift Command N");
        expect(describeShortcut("alt+mod+n", false)).toBe("Control Alt N");
        expect(describeShortcut("alt+ArrowUp", true)).toBe("Option Up Arrow");
        expect(describeShortcut("Escape", false)).toBe("Escape");
        expect(describeShortcut("?", false)).toBe("?");
    });

    it("takes the key names from labels", () => {
        expect(describeShortcut("mod+Enter", false, { control: "Strg", enter: "Eingabe" })).toBe("Strg Eingabe");
    });
});

describe("useKeyboardShortcut", () => {
    it("ignores shortcuts without a modifier while typing in a field", () => {
        const onShortcut = vi.fn();
        renderHook(() => useKeyboardShortcut("/", onShortcut));
        const { getByRole } = render(<input aria-label="Title" />);

        fireEvent.keyDown(getByRole("textbox"), { key: "/" });
        expect(onShortcut).not.toHaveBeenCalled();

        fireEvent.keyDown(document.body, { key: "/" });
        expect(onShortcut).toHaveBeenCalledTimes(1);
    });

    it("listens to mod for the platform of the provider", () => {
        const onShortcut = vi.fn();
        renderHook(() => useKeyboardShortcut("mod+k", onShortcut), {
            wrapper: ({ children }) => <KeyboardShortcutProvider platform="apple">{children}</KeyboardShortcutProvider>,
        });

        fireEvent.keyDown(document.body, { key: "k", ctrlKey: true });
        expect(onShortcut).not.toHaveBeenCalled();

        fireEvent.keyDown(document.body, { key: "k", metaKey: true });
        expect(onShortcut).toHaveBeenCalledTimes(1);
    });

    it("does not listen while disabled", () => {
        const onShortcut = vi.fn();
        renderHook(() => useKeyboardShortcut("/", onShortcut, { enabled: false }));

        fireEvent.keyDown(document.body, { key: "/" });
        expect(onShortcut).not.toHaveBeenCalled();
    });
});
