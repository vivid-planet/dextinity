import { cleanup, fireEvent, render, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ariaKeyShortcuts, describeShortcut, formatShortcut, formatShortcutText } from "../formatShortcut";
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

    it("accepts symbols typed with AltGr on Windows and Linux, which reports Ctrl and Alt", () => {
        const altGrBackslash = { ...noModifiers, key: "\\", ctrlKey: true, altKey: true };
        expect(matchesShortcut(altGrBackslash, "mod+\\", false)).toBe(true);
        expect(matchesShortcut(altGrBackslash, "\\", false)).toBe(true);
        expect(matchesShortcut({ ...noModifiers, key: "n", ctrlKey: true, altKey: true }, "mod+n", false)).toBe(false);
    });

    it("accepts symbols typed with Option on Apple platforms", () => {
        expect(matchesShortcut({ ...noModifiers, key: "\\", metaKey: true, altKey: true, shiftKey: true }, "mod+\\", true)).toBe(true);
        expect(matchesShortcut({ ...noModifiers, key: "\\", ctrlKey: true, altKey: true }, "mod+\\", true)).toBe(false);
        expect(matchesShortcut({ ...noModifiers, key: "/" }, "alt+/", true)).toBe(false);
    });

    it("matches the space and plus keys", () => {
        expect(matchesShortcut({ ...noModifiers, key: " ", ctrlKey: true }, "mod+space", false)).toBe(true);
        expect(matchesShortcut({ ...noModifiers, key: "+", ctrlKey: true, shiftKey: true }, "mod++", false)).toBe(true);
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

    it("names keys in any case", () => {
        expect(formatShortcut("mod+space", false)).toEqual(["Ctrl", "Space"]);
        expect(formatShortcut("shift+ ", false)).toEqual(["Shift", "Space"]);
        expect(formatShortcut("tab", false)).toEqual(["Tab"]);
        expect(formatShortcut("mod++", true)).toEqual(["⌘", "+"]);
    });

    it("joins the key caps as text", () => {
        expect(formatShortcutText("shift+mod+n", true)).toBe("⇧⌘N");
        expect(formatShortcutText("shift+mod+n", false)).toBe("Ctrl+Shift+N");
    });
});

describe("describeShortcut", () => {
    it("returns the spoken name for the platform", () => {
        expect(describeShortcut("shift+mod+n", true)).toBe("Shift Command N");
        expect(describeShortcut("alt+mod+n", false)).toBe("Control Alt N");
        expect(describeShortcut("alt+ArrowUp", true)).toBe("Option Up Arrow");
        expect(describeShortcut("Escape", false)).toBe("Escape");
        expect(describeShortcut("?", false)).toBe("Question Mark");
    });

    it("names punctuation, which screen readers skip at their default punctuation level", () => {
        expect(describeShortcut("mod+,", true)).toBe("Command Comma");
        expect(describeShortcut("mod+.", true)).toBe("Command Period");
        expect(describeShortcut("mod+/", false)).toBe("Control Slash");
        expect(describeShortcut("mod+\\", false)).toBe("Control Backslash");
        expect(describeShortcut("mod++", false)).toBe("Control Plus");
    });

    it("takes the key names from labels", () => {
        expect(describeShortcut("mod+Enter", false, { control: "Strg", enter: "Eingabe" })).toBe("Strg Eingabe");
    });
});

describe("ariaKeyShortcuts", () => {
    it("returns the value of aria-keyshortcuts for the platform", () => {
        expect(ariaKeyShortcuts("mod+k", true)).toBe("Meta+K");
        expect(ariaKeyShortcuts("shift+mod+n", false)).toBe("Control+Shift+N");
        expect(ariaKeyShortcuts("alt+ArrowUp", true)).toBe("Alt+ArrowUp");
        expect(ariaKeyShortcuts("mod++", false)).toBe("Control+Plus");
        expect(ariaKeyShortcuts("space", false)).toBe("Space");
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
