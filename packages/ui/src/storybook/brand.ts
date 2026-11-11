import { useSyncExternalStore } from "react";

import type { ThemeBrand } from "../theme/types";

type ToolbarBrand = ThemeBrand;

const toolbarBrandTitles: Record<ToolbarBrand, string> = {
    dextinity: "Dextinity",
    "ai-hub": "Dextinity AI Hub",
};

export const toolbarBrandOptions = Object.entries(toolbarBrandTitles).map(([value, title]) => ({ value, title }));

const toolbarBrandStorageKey = "dextinity-ui-brand";

function isToolbarBrand(value: unknown): value is ToolbarBrand {
    return typeof value === "string" && value in toolbarBrandTitles;
}

export function getToolbarBrand(): ToolbarBrand {
    const storedValue = localStorage.getItem(toolbarBrandStorageKey);
    return isToolbarBrand(storedValue) ? storedValue : "dextinity";
}

export function storeToolbarBrand(value: unknown) {
    if (isToolbarBrand(value)) {
        localStorage.setItem(toolbarBrandStorageKey, value);
    }
}

function subscribeToToolbarBrand(onChange: () => void) {
    function handleStorage(event: StorageEvent) {
        if (event.key === toolbarBrandStorageKey) {
            onChange();
        }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
}

export function useToolbarBrand(): ToolbarBrand {
    return useSyncExternalStore(subscribeToToolbarBrand, getToolbarBrand);
}
