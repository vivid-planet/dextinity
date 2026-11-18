import { createToolbarSetting } from "./toolbarSetting";

/**
 * The platform keyboard shortcuts are shown and matched for, e.g. to check the Windows key caps on a Mac.
 */
export const keyboardPlatformSetting = createToolbarSetting({
    storageKey: "dextinity-ui-keyboard-platform",
    titles: {
        detected: "Detected platform",
        apple: "Apple (⌘)",
        other: "Windows & Linux (Ctrl)",
    },
    defaultValue: "detected",
});
