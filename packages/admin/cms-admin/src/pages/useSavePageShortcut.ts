import { type KeyboardShortcutOptions, useKeyboardShortcut } from "@dextinity/ui";

/**
 * Saves the page with ⌘S / Ctrl+S, also while typing in a field, instead of the browser saving the HTML.
 */
export function useSavePageShortcut(handleSavePage: () => Promise<void> | void, { enabled = true }: Pick<KeyboardShortcutOptions, "enabled"> = {}) {
    useKeyboardShortcut(
        "mod+s",
        () => {
            void handleSavePage();
        },
        { enabled, allowInEditable: true },
    );
}
