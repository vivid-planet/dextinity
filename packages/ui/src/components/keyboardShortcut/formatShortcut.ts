import { isApplePlatform } from "./keyboardShortcutPlatform";

export interface ParsedShortcut {
    key: string;
    mod: boolean;
    shift: boolean;
    alt: boolean;
}

function splitShortcut(shortcut: string) {
    const parts = shortcut.split("+");
    const key = parts.pop() ?? "";
    return { key, modifiers: parts.map((part) => part.toLowerCase()) };
}

export function parseShortcut(shortcut: string): ParsedShortcut {
    const { key, modifiers } = splitShortcut(shortcut);
    return {
        key: key.toLowerCase(),
        mod: modifiers.includes("mod"),
        shift: modifiers.includes("shift"),
        alt: modifiers.includes("alt"),
    };
}

/**
 * The spoken names of keys, read by screen readers instead of the key caps.
 */
export interface KeyboardShortcutLabels {
    /** `mod` on Apple platforms (⌘). */
    command: string;
    /** `mod` on other platforms (Ctrl). */
    control: string;
    shift: string;
    /** `alt` on Apple platforms (⌥). */
    option: string;
    /** `alt` on other platforms. */
    alt: string;
    escape: string;
    enter: string;
    backspace: string;
    delete: string;
    tab: string;
    space: string;
    arrowUp: string;
    arrowDown: string;
    arrowLeft: string;
    arrowRight: string;
}

const defaultKeyboardShortcutLabels: KeyboardShortcutLabels = {
    command: "Command",
    control: "Control",
    shift: "Shift",
    option: "Option",
    alt: "Alt",
    escape: "Escape",
    enter: "Enter",
    backspace: "Backspace",
    delete: "Delete",
    tab: "Tab",
    space: "Space",
    arrowUp: "Up Arrow",
    arrowDown: "Down Arrow",
    arrowLeft: "Left Arrow",
    arrowRight: "Right Arrow",
};

// Apple lists modifiers as ⌥⇧⌘, Windows and Linux as Ctrl+Shift+Alt
const appleModifierOrder = ["alt", "shift", "mod"];
const otherModifierOrder = ["mod", "shift", "alt"];

function sortedModifiers(modifiers: string[], apple: boolean) {
    const order = apple ? appleModifierOrder : otherModifierOrder;
    const rank = (modifier: string) => {
        const index = order.indexOf(modifier);
        return index === -1 ? order.length : index;
    };
    return [...modifiers].sort((a, b) => rank(a) - rank(b));
}

const appleModifierCaps: Record<string, string> = { mod: "⌘", shift: "⇧", alt: "⌥" };
const otherModifierCaps: Record<string, string> = { mod: "Ctrl", shift: "Shift", alt: "Alt" };
const keyCaps: Record<string, string> = {
    escape: "Esc",
    arrowup: "↑",
    arrowdown: "↓",
    arrowleft: "←",
    arrowright: "→",
    backspace: "⌫",
    enter: "Enter",
};

/**
 * The key caps of a shortcut for display, e.g. `["⌘", "S"]` for `"mod+s"` on Apple platforms and `["Ctrl", "S"]` elsewhere. Modifiers
 * are put in the platform's order, e.g. `["⇧", "⌘", "N"]` and `["Ctrl", "Shift", "N"]` for `"shift+mod+n"`.
 *
 * To show a shortcut, pass it to `KeyboardShortcut`'s `shortcut` instead: it also gives screen readers its spoken name.
 */
export function formatShortcut(shortcut: string, apple = isApplePlatform()): string[] {
    const { key, modifiers } = splitShortcut(shortcut);
    const caps = apple ? appleModifierCaps : otherModifierCaps;
    const modifierCaps = sortedModifiers(modifiers, apple).map((modifier) => caps[modifier] ?? modifier);
    const keyCap = keyCaps[key.toLowerCase()] ?? (key.length === 1 ? key.toUpperCase() : key);
    return [...modifierCaps, keyCap];
}

const spokenKeyNames: Record<string, keyof KeyboardShortcutLabels> = {
    escape: "escape",
    enter: "enter",
    backspace: "backspace",
    delete: "delete",
    tab: "tab",
    space: "space",
    " ": "space",
    arrowup: "arrowUp",
    arrowdown: "arrowDown",
    arrowleft: "arrowLeft",
    arrowright: "arrowRight",
};

/**
 * The spoken name of a shortcut, e.g. "Command S" for `"mod+s"` on Apple platforms and "Control S" elsewhere.
 */
export function describeShortcut(shortcut: string, apple = isApplePlatform(), labels: Partial<KeyboardShortcutLabels> = {}): string {
    const names = { ...defaultKeyboardShortcutLabels, ...labels };
    const { key, modifiers } = splitShortcut(shortcut);
    const modifierNames: Record<string, string> = apple
        ? { mod: names.command, shift: names.shift, alt: names.option }
        : { mod: names.control, shift: names.shift, alt: names.alt };
    const spokenModifiers = sortedModifiers(modifiers, apple).map((modifier) => modifierNames[modifier] ?? modifier);
    const namedKey = spokenKeyNames[key.toLowerCase()];
    const spokenKey = namedKey != null ? names[namedKey] : key.length === 1 ? key.toUpperCase() : key;
    return [...spokenModifiers, spokenKey].join(" ");
}
