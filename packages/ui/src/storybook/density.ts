import { useSyncExternalStore } from "react";

import type { ThemeDensity } from "../theme/types";

const toolbarDensityTitles: Record<ThemeDensity, string> = {
    comfortable: "Comfortable",
    standard: "Standard",
    compact: "Compact",
};

export const toolbarDensityOptions = Object.entries(toolbarDensityTitles).map(([value, title]) => ({ value, title }));

const toolbarDensityStorageKey = "dextinity-ui-density";

function isToolbarDensity(value: unknown): value is ThemeDensity {
    return typeof value === "string" && value in toolbarDensityTitles;
}

export function getToolbarDensity(): ThemeDensity {
    const storedValue = localStorage.getItem(toolbarDensityStorageKey);
    return isToolbarDensity(storedValue) ? storedValue : "standard";
}

export function storeToolbarDensity(value: unknown) {
    if (isToolbarDensity(value)) {
        localStorage.setItem(toolbarDensityStorageKey, value);
    }
}

function subscribeToToolbarDensity(onChange: () => void) {
    function handleStorage(event: StorageEvent) {
        if (event.key === toolbarDensityStorageKey) {
            onChange();
        }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
}

export function useToolbarDensity(): ThemeDensity {
    return useSyncExternalStore(subscribeToToolbarDensity, getToolbarDensity);
}
