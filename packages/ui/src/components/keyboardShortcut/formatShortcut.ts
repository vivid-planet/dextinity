import { isApplePlatform } from "./keyboardShortcutPlatform";

export interface ParsedShortcut {
    key: string;
    mod: boolean;
    shift: boolean;
    alt: boolean;
}

// A trailing "+" is the plus key itself, e.g. `"mod++"`
function splitShortcut(shortcut: string) {
    const plusKey = shortcut.endsWith("+");
    const parts = (plusKey ? shortcut.slice(0, -1) : shortcut).split("+");
    const lastPart = parts.pop() ?? "";
    const key = plusKey ? "+" : lastPart;
    return { key, modifiers: parts.map((part) => part.toLowerCase()) };
}

/**
 * The key in lower case, with the space character named `space` like in the notation.
 */
export function normalizeKey(key: string) {
    return key === " " ? "space" : key.toLowerCase();
}

export function isSymbolKey(key: string) {
    return key.length === 1 && key.toLowerCase() === key.toUpperCase();
}

export function parseShortcut(shortcut: string): ParsedShortcut {
    const { key, modifiers } = splitShortcut(shortcut);
    return {
        key: normalizeKey(key),
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
    comma: string;
    period: string;
    slash: string;
    backslash: string;
    plus: string;
    minus: string;
    questionMark: string;
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
    comma: "Comma",
    period: "Period",
    slash: "Slash",
    backslash: "Backslash",
    plus: "Plus",
    minus: "Minus",
    questionMark: "Question Mark",
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
    space: "Space",
};

function capitalize(key: string) {
    return key.charAt(0).toUpperCase() + key.slice(1);
}

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
    const keyCap = keyCaps[normalizeKey(key)] ?? capitalize(key);
    return [...modifierCaps, keyCap];
}

/**
 * The key caps of a shortcut as plain text, e.g. `"⌘S"` for `"mod+s"` on Apple platforms and `"Ctrl+S"` elsewhere, for places that
 * only take text, such as a `title`.
 */
export function formatShortcutText(shortcut: string, apple = isApplePlatform()): string {
    return formatShortcut(shortcut, apple).join(apple ? "" : "+");
}

const spokenKeyNames: Record<string, keyof KeyboardShortcutLabels> = {
    escape: "escape",
    enter: "enter",
    backspace: "backspace",
    delete: "delete",
    tab: "tab",
    space: "space",
    arrowup: "arrowUp",
    arrowdown: "arrowDown",
    arrowleft: "arrowLeft",
    arrowright: "arrowRight",
    ",": "comma",
    ".": "period",
    "/": "slash",
    "\\": "backslash",
    "+": "plus",
    "-": "minus",
    "?": "questionMark",
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
    const namedKey = spokenKeyNames[normalizeKey(key)];
    const spokenKey = namedKey != null ? names[namedKey] : capitalize(key);
    return [...spokenModifiers, spokenKey].join(" ");
}

const ariaModifierNames: Record<string, string> = { shift: "Shift", alt: "Alt" };
const ariaKeyNames: Record<string, string> = {
    space: "Space",
    "+": "Plus",
    escape: "Escape",
    enter: "Enter",
    backspace: "Backspace",
    delete: "Delete",
    tab: "Tab",
    arrowup: "ArrowUp",
    arrowdown: "ArrowDown",
    arrowleft: "ArrowLeft",
    arrowright: "ArrowRight",
};

/**
 * The shortcut as the value of `aria-keyshortcuts`, e.g. `"Meta+K"` for `"mod+k"` on Apple platforms and `"Control+K"` elsewhere.
 */
export function ariaKeyShortcuts(shortcut: string, apple = isApplePlatform()): string {
    const { key, modifiers } = splitShortcut(shortcut);
    const names: Record<string, string> = { ...ariaModifierNames, mod: apple ? "Meta" : "Control" };
    const ariaModifiers = sortedModifiers(modifiers, false).map((modifier) => names[modifier] ?? capitalize(modifier));
    return [...ariaModifiers, ariaKeyNames[normalizeKey(key)] ?? capitalize(key)].join("+");
}
