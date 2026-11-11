import { useSyncExternalStore } from "react";

import type { ThemeColorScheme } from "../theme/types";

type ToolbarColorScheme = ThemeColorScheme;

const toolbarColorSchemeTitles: Record<ToolbarColorScheme, string> = {
    light: "Light mode",
    dark: "Dark mode",
    "high-contrast": "High contrast mode",
};

export const toolbarColorSchemeOptions = Object.entries(toolbarColorSchemeTitles).map(([value, title]) => ({ value, title }));

const toolbarColorSchemeStorageKey = "dextinity-ui-color-scheme";

function isToolbarColorScheme(value: unknown): value is ToolbarColorScheme {
    return typeof value === "string" && value in toolbarColorSchemeTitles;
}

export function getToolbarColorScheme(): ToolbarColorScheme {
    const storedValue = localStorage.getItem(toolbarColorSchemeStorageKey);
    return isToolbarColorScheme(storedValue) ? storedValue : "light";
}

export function storeToolbarColorScheme(value: unknown) {
    if (isToolbarColorScheme(value)) {
        localStorage.setItem(toolbarColorSchemeStorageKey, value);
    }
}

function subscribeToToolbarColorScheme(onChange: () => void) {
    function handleStorage(event: StorageEvent) {
        if (event.key === toolbarColorSchemeStorageKey) {
            onChange();
        }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
}

export function useAppliedColorScheme(): ThemeColorScheme {
    return useSyncExternalStore(subscribeToToolbarColorScheme, getToolbarColorScheme);
}
