import { cleanup, fireEvent, render, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { formatShortcut, matchesShortcut, useKeyboardShortcut } from "./useKeyboardShortcut";

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

    it("does not listen while disabled", () => {
        const onShortcut = vi.fn();
        renderHook(() => useKeyboardShortcut("/", onShortcut, { enabled: false }));

        fireEvent.keyDown(document.body, { key: "/" });
        expect(onShortcut).not.toHaveBeenCalled();
    });
});
