import { useSyncExternalStore } from "react";

import type { ThemeColorScheme } from "../theme/types";

type ToolbarColorScheme = ThemeColorScheme | "system";

const toolbarColorSchemeTitles: Record<ToolbarColorScheme, string> = {
    light: "Light mode",
    dark: "Dark mode",
    "high-contrast": "High contrast mode",
    system: "Follow system",
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

const moreContrastQuery = window.matchMedia("(prefers-contrast: more)");
const darkColorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

function getSystemColorScheme(): ThemeColorScheme {
    if (moreContrastQuery.matches) {
        return "high-contrast";
    }
    if (darkColorSchemeQuery.matches) {
        return "dark";
    }
    return "light";
}

function getAppliedColorScheme(): ThemeColorScheme {
    const toolbarColorScheme = getToolbarColorScheme();
    return toolbarColorScheme === "system" ? getSystemColorScheme() : toolbarColorScheme;
}

function subscribeToAppliedColorScheme(onChange: () => void) {
    function handleStorage(event: StorageEvent) {
        if (event.key === toolbarColorSchemeStorageKey) {
            onChange();
        }
    }

    window.addEventListener("storage", handleStorage);
    moreContrastQuery.addEventListener("change", onChange);
    darkColorSchemeQuery.addEventListener("change", onChange);
    return () => {
        window.removeEventListener("storage", handleStorage);
        moreContrastQuery.removeEventListener("change", onChange);
        darkColorSchemeQuery.removeEventListener("change", onChange);
    };
}

export function useAppliedColorScheme(): ThemeColorScheme {
    return useSyncExternalStore(subscribeToAppliedColorScheme, getAppliedColorScheme);
}
