import { useEffect, useRef } from "react";

interface ParsedShortcut {
    key: string;
    mod: boolean;
    shift: boolean;
    alt: boolean;
}

function parseShortcut(shortcut: string): ParsedShortcut {
    const parts = shortcut.split("+");
    const key = parts.pop() ?? "";
    const modifiers = parts.map((part) => part.toLowerCase());
    return {
        key: key.toLowerCase(),
        mod: modifiers.includes("mod"),
        shift: modifiers.includes("shift"),
        alt: modifiers.includes("alt"),
    };
}

/**
 * Whether the platform uses ⌘ (Apple devices) rather than Ctrl as the shortcut modifier.
 */
export function isApplePlatform(): boolean {
    if (typeof navigator === "undefined") {
        return false;
    }
    return /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
}

/**
 * Whether a keyboard event matches a shortcut such as `"mod+s"`, `"shift+mod+n"`, `"/"` or `"Escape"`.
 *
 * `mod` is ⌘ on Apple platforms and Ctrl elsewhere. Shift is ignored for keys that are symbols (e.g. `"?"`), since keyboard layouts
 * differ in whether they need it.
 */
export function matchesShortcut(
    event: Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey">,
    shortcut: string,
    apple = isApplePlatform(),
) {
    const parsed = parseShortcut(shortcut);
    const modPressed = apple ? event.metaKey : event.ctrlKey;
    const otherModifierPressed = apple ? event.ctrlKey : event.metaKey;
    const isSymbol = parsed.key.length === 1 && parsed.key.toLowerCase() === parsed.key.toUpperCase();

    if (event.key.toLowerCase() !== parsed.key) {
        return false;
    }
    if (modPressed !== parsed.mod || otherModifierPressed || event.altKey !== parsed.alt) {
        return false;
    }
    return isSymbol || event.shiftKey === parsed.shift;
}

const appleKeyNames: Record<string, string> = { mod: "⌘", shift: "⇧", alt: "⌥" };
const otherKeyNames: Record<string, string> = { mod: "Ctrl", shift: "Shift", alt: "Alt" };
const keyNames: Record<string, string> = {
    escape: "Esc",
    arrowup: "↑",
    arrowdown: "↓",
    arrowleft: "←",
    arrowright: "→",
    backspace: "⌫",
    enter: "Enter",
};

/**
 * The key caps of a shortcut for display, e.g. `["⌘", "S"]` for `"mod+s"` on Apple platforms and `["Ctrl", "S"]` elsewhere. Pass
 * them to `Kbd`, `ShortcutList` or a tooltip's `shortcut`.
 */
export function formatShortcut(shortcut: string, apple = isApplePlatform()): string[] {
    const parts = shortcut.split("+");
    const key = parts.pop() ?? "";
    const names = apple ? appleKeyNames : otherKeyNames;
    const modifiers = parts.map((part) => names[part.toLowerCase()] ?? part);
    const keyName = keyNames[key.toLowerCase()] ?? (key.length === 1 ? key.toUpperCase() : key);
    return [...modifiers, keyName];
}

function isEditable(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
        return false;
    }
    return target.isContentEditable || target.closest("input, textarea, select, [contenteditable='true']") != null;
}

export interface KeyboardShortcutOptions {
    /**
     * Listens only while true, e.g. while a page is in edit mode.
     *
     * @defaultValue `true`
     */
    enabled?: boolean;
    /**
     * Also fires while typing in a text field. Off by default for shortcuts without a modifier, so typing `/` or `?` in a field
     * stays typing; shortcuts with `mod` always fire.
     */
    allowInEditable?: boolean;
}

/**
 * Calls `onShortcut` when the shortcut is pressed anywhere in the document, e.g. `"mod+s"` to save or `"/"` to focus the search.
 * The browser's own action for the keys is prevented. A key event something else already handled (`defaultPrevented`) is ignored.
 */
export function useKeyboardShortcut(shortcut: string, onShortcut: (event: KeyboardEvent) => void, options: KeyboardShortcutOptions = {}) {
    const { enabled = true, allowInEditable = false } = options;
    const onShortcutRef = useRef(onShortcut);
    onShortcutRef.current = onShortcut;

    useEffect(() => {
        if (!enabled) {
            return;
        }
        const hasModifier = parseShortcut(shortcut).mod;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.defaultPrevented || event.isComposing || !matchesShortcut(event, shortcut)) {
                return;
            }
            if (!hasModifier && !allowInEditable && isEditable(event.target)) {
                return;
            }
            event.preventDefault();
            onShortcutRef.current(event);
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [shortcut, enabled, allowInEditable]);
}
