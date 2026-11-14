import { useSyncExternalStore } from "react";

import type { ThemeColorScheme } from "../theme/types";
import { createToolbarSetting } from "./toolbarSetting";

export const colorSchemeSetting = createToolbarSetting<ThemeColorScheme | "system">({
    storageKey: "dextinity-ui-color-scheme",
    titles: {
        light: "Light mode",
        dark: "Dark mode",
        "high-contrast": "High contrast mode",
        system: "Follow system",
    },
    defaultValue: "light",
});

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
    const toolbarColorScheme = colorSchemeSetting.get();
    return toolbarColorScheme === "system" ? getSystemColorScheme() : toolbarColorScheme;
}

function subscribeToAppliedColorScheme(onChange: () => void) {
    const unsubscribe = colorSchemeSetting.subscribe(onChange);
    moreContrastQuery.addEventListener("change", onChange);
    darkColorSchemeQuery.addEventListener("change", onChange);
    return () => {
        unsubscribe();
        moreContrastQuery.removeEventListener("change", onChange);
        darkColorSchemeQuery.removeEventListener("change", onChange);
    };
}

export function useAppliedColorScheme(): ThemeColorScheme {
    return useSyncExternalStore(subscribeToAppliedColorScheme, getAppliedColorScheme);
}
