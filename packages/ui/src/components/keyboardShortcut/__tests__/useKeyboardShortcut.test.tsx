import { cleanup, fireEvent, render, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ariaKeyShortcuts, describeKeyboardShortcut, formatKeyboardShortcut, formatKeyboardShortcutText } from "../formatKeyboardShortcut";
import { KeyboardShortcutProvider } from "../keyboardShortcutPlatform";
import { matchesKeyboardShortcut, useKeyboardShortcut } from "../useKeyboardShortcut";

afterEach(cleanup);

const noModifiers = { metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };

describe("matchesKeyboardShortcut", () => {
    it("treats mod as ⌘ on Apple platforms and as Ctrl elsewhere", () => {
        expect(matchesKeyboardShortcut({ ...noModifiers, key: "s", metaKey: true }, "mod+s", true)).toBe(true);
        expect(matchesKeyboardShortcut({ ...noModifiers, key: "s", ctrlKey: true }, "mod+s", true)).toBe(false);
        expect(matchesKeyboardShortcut({ ...noModifiers, key: "s", ctrlKey: true }, "mod+s", false)).toBe(true);
    });

    it("requires exactly the given modifiers for letters", () => {
        expect(matchesKeyboardShortcut({ ...noModifiers, key: "N", metaKey: true, shiftKey: true }, "shift+mod+n", true)).toBe(true);
        expect(matchesKeyboardShortcut({ ...noModifiers, key: "n", metaKey: true }, "shift+mod+n", true)).toBe(false);
        expect(matchesKeyboardShortcut({ ...noModifiers, key: "s", metaKey: true, shiftKey: true }, "mod+s", true)).toBe(false);
    });

    it("ignores shift for symbols", () => {
        expect(matchesKeyboardShortcut({ ...noModifiers, key: "?", shiftKey: true }, "?", true)).toBe(true);
    });

    it("accepts symbols typed with AltGr on Windows and Linux, which reports Ctrl and Alt", () => {
        const altGrBackslash = { ...noModifiers, key: "\\", ctrlKey: true, altKey: true };
        expect(matchesKeyboardShortcut(altGrBackslash, "mod+\\", false)).toBe(true);
        expect(matchesKeyboardShortcut(altGrBackslash, "\\", false)).toBe(true);
        expect(matchesKeyboardShortcut({ ...noModifiers, key: "n", ctrlKey: true, altKey: true }, "mod+n", false)).toBe(false);
    });

    it("accepts symbols typed with Option on Apple platforms", () => {
        expect(matchesKeyboardShortcut({ ...noModifiers, key: "\\", metaKey: true, altKey: true, shiftKey: true }, "mod+\\", true)).toBe(true);
        expect(matchesKeyboardShortcut({ ...noModifiers, key: "\\", ctrlKey: true, altKey: true }, "mod+\\", true)).toBe(false);
        expect(matchesKeyboardShortcut({ ...noModifiers, key: "/" }, "alt+/", true)).toBe(false);
    });

    it("matches the space and plus keys", () => {
        expect(matchesKeyboardShortcut({ ...noModifiers, key: " ", ctrlKey: true }, "mod+space", false)).toBe(true);
        expect(matchesKeyboardShortcut({ ...noModifiers, key: "+", ctrlKey: true, shiftKey: true }, "mod++", false)).toBe(true);
    });
});

describe("formatKeyboardShortcut", () => {
    it("returns the platform's key caps", () => {
        expect(formatKeyboardShortcut("shift+mod+n", true)).toEqual(["⇧", "⌘", "N"]);
        expect(formatKeyboardShortcut("mod+s", false)).toEqual(["Ctrl", "S"]);
        expect(formatKeyboardShortcut("Escape", true)).toEqual(["Esc"]);
    });

    it("puts the modifiers in the platform's order", () => {
        expect(formatKeyboardShortcut("mod+shift+alt+n", true)).toEqual(["⌥", "⇧", "⌘", "N"]);
        expect(formatKeyboardShortcut("alt+shift+mod+n", false)).toEqual(["Ctrl", "Shift", "Alt", "N"]);
    });

    it("names keys in any case", () => {
        expect(formatKeyboardShortcut("mod+space", false)).toEqual(["Ctrl", "Space"]);
        expect(formatKeyboardShortcut("shift+ ", false)).toEqual(["Shift", "Space"]);
        expect(formatKeyboardShortcut("tab", false)).toEqual(["Tab"]);
        expect(formatKeyboardShortcut("mod++", true)).toEqual(["⌘", "+"]);
    });

    it("joins the key caps as text", () => {
        expect(formatKeyboardShortcutText("shift+mod+n", true)).toBe("⇧⌘N");
        expect(formatKeyboardShortcutText("shift+mod+n", false)).toBe("Ctrl+Shift+N");
    });
});

describe("describeKeyboardShortcut", () => {
    it("returns the spoken name for the platform", () => {
        expect(describeKeyboardShortcut("shift+mod+n", true)).toBe("Shift Command N");
        expect(describeKeyboardShortcut("alt+mod+n", false)).toBe("Control Alt N");
        expect(describeKeyboardShortcut("alt+ArrowUp", true)).toBe("Option Up Arrow");
        expect(describeKeyboardShortcut("Escape", false)).toBe("Escape");
        expect(describeKeyboardShortcut("?", false)).toBe("Question Mark");
    });

    it("names punctuation, which screen readers skip at their default punctuation level", () => {
        expect(describeKeyboardShortcut("mod+,", true)).toBe("Command Comma");
        expect(describeKeyboardShortcut("mod+.", true)).toBe("Command Period");
        expect(describeKeyboardShortcut("mod+/", false)).toBe("Control Slash");
        expect(describeKeyboardShortcut("mod+\\", false)).toBe("Control Backslash");
        expect(describeKeyboardShortcut("mod++", false)).toBe("Control Plus");
    });

    it("takes the key names from labels", () => {
        expect(describeKeyboardShortcut("mod+Enter", false, { control: "Strg", enter: "Eingabe" })).toBe("Strg Eingabe");
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
