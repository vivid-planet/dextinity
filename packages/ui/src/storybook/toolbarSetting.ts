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

    // A frame can set its own value through its address, e.g. two variants side by side with different brands
    function getFrameValue() {
        const frameValue = new URLSearchParams(window.location.search).get(storageKey);
        return isValue(frameValue) ? frameValue : null;
    }

    function get(): Value {
        const storedValue = localStorage.getItem(storageKey);
        return getFrameValue() ?? (isValue(storedValue) ? storedValue : defaultValue);
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
        storageKey,
        options: Object.entries<string>(titles).map(([value, title]) => ({ value, title })),
        get,
        store,
        subscribe,
        useValue: () => useSyncExternalStore(subscribe, get),
    };
}
