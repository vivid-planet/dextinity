import { ariaKeyShortcuts } from "./formatShortcut";
import { type KeyboardShortcutPlatform, useKeyboardShortcutPlatform } from "./keyboardShortcutPlatform";

/**
 * The `aria-keyshortcuts` value of a shortcut for the platform, so screen readers announce it on the element that has it. A tooltip or a
 * key cap hidden from the accessible name doesn't.
 */
export function useAriaKeyShortcuts(shortcut: string | undefined, platform?: KeyboardShortcutPlatform): string | undefined {
    const apple = useKeyboardShortcutPlatform(platform) === "apple";
    return shortcut == null ? undefined : ariaKeyShortcuts(shortcut, apple);
}
