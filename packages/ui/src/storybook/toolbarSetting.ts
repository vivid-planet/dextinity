import { useSyncExternalStore } from "react";

/**
 * A Storybook toolbar setting persisted in `localStorage`, shared between the manager (toolbar) and the preview (stories) frames.
 */
export function createToolbarSetting<Value extends string>({
    storageKey,
    titles,
    defaultValue,
}: {
    storageKey: string;
    titles: Record<Value, string>;
    defaultValue: NoInfer<Value>;
}) {
    function isValue(value: unknown): value is Value {
        return typeof value === "string" && value in titles;
    }

    function get(): Value {
        const storedValue = localStorage.getItem(storageKey);
        return isValue(storedValue) ? storedValue : defaultValue;
    }

    function store(value: unknown) {
        if (isValue(value)) {
            localStorage.setItem(storageKey, value);
        }
    }

    function subscribe(onChange: () => void) {
        function handleStorage(event: StorageEvent) {
            if (event.key === storageKey) {
                onChange();
            }
        }

        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }

    return {
        options: Object.entries<string>(titles).map(([value, title]) => ({ value, title })),
        get,
        store,
        subscribe,
        useValue: () => useSyncExternalStore(subscribe, get),
    };
}
