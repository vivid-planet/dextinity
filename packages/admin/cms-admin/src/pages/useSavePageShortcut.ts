import { type KeyboardShortcutOptions, useKeyboardShortcut } from "@dextinity/ui";

interface SavePageShortcutOptions extends Pick<KeyboardShortcutOptions, "enabled"> {
    hasChanges: boolean | undefined;
    saving: boolean;
}

/**
 * Saves the page with ⌘S / Ctrl+S, also while typing in a field, instead of the browser saving the HTML. Like the save button, it only
 * saves when there are changes and no save is running, as saving an unchanged page would still store a new version.
 */
export function useSavePageShortcut(handleSavePage: () => Promise<unknown> | void, { hasChanges, saving, enabled = true }: SavePageShortcutOptions) {
    useKeyboardShortcut(
        "mod+s",
        () => {
            if (hasChanges && !saving) {
                void handleSavePage();
            }
        },
        { enabled, allowInEditable: true },
    );
}
