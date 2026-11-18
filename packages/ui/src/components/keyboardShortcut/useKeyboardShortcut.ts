import { useEffect, useRef } from "react";

import { isSymbolKey, normalizeKey, parseShortcut } from "./formatShortcut";
import { isApplePlatform, useKeyboardShortcutPlatform } from "./keyboardShortcutPlatform";

/**
 * Whether a keyboard event matches a shortcut such as `"mod+s"`, `"shift+mod+n"`, `"/"` or `"Escape"`.
 *
 * `mod` is ⌘ on Apple platforms and Ctrl elsewhere. Shift and Alt are ignored for keys that are symbols (e.g. `"?"` or `"\\"`), since
 * keyboard layouts differ in whether they need them: `\\` is AltGr+ß on German Windows keyboards and ⌥⇧7 on German Macs.
 */
export function matchesShortcut(
    event: Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey">,
    shortcut: string,
    apple = isApplePlatform(),
) {
    const parsed = parseShortcut(shortcut);
    const modPressed = apple ? event.metaKey : event.ctrlKey;
    const otherModifierPressed = apple ? event.ctrlKey : event.metaKey;
    const isSymbol = isSymbolKey(parsed.key);
    // AltGr reports Ctrl and Alt as pressed on Windows, so with it Ctrl can't tell whether `mod` is pressed too
    const altGr = !apple && isSymbol && event.ctrlKey && event.altKey;

    if (normalizeKey(event.key) !== parsed.key) {
        return false;
    }
    if (otherModifierPressed || (!altGr && modPressed !== parsed.mod)) {
        return false;
    }
    if (parsed.alt ? !event.altKey : event.altKey && !isSymbol) {
        return false;
    }
    return isSymbol || event.shiftKey === parsed.shift;
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
 * `mod` follows the platform of the nearest `KeyboardShortcutProvider`, else the detected one.
 */
export function useKeyboardShortcut(shortcut: string, onShortcut: (event: KeyboardEvent) => void, options: KeyboardShortcutOptions = {}) {
    const { enabled = true, allowInEditable = false } = options;
    const apple = useKeyboardShortcutPlatform() === "apple";
    const onShortcutRef = useRef(onShortcut);
    onShortcutRef.current = onShortcut;

    useEffect(() => {
        if (!enabled) {
            return;
        }
        const hasModifier = parseShortcut(shortcut).mod;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.defaultPrevented || event.isComposing || !matchesShortcut(event, shortcut, apple)) {
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
    }, [shortcut, enabled, allowInEditable, apple]);
}
