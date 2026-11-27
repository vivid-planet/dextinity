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
    // The browser tells only the other windows about a change of `localStorage`, so this one is told here
    const listeners = new Set<() => void>();

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
            listeners.forEach((listener) => listener());
        }
    }

    /** Changes the value only for this frame when its address sets its own, e.g. one of two variants side by side; else for all. */
    function storeForFrame(value: Value) {
        if (getFrameValue() === null) {
            store(value);
            return;
        }
        const url = new URL(window.location.href);
        url.searchParams.set(storageKey, value);
        window.history.replaceState(window.history.state, "", url);
        listeners.forEach((listener) => listener());
    }

    function subscribe(onChange: () => void) {
        function handleStorage(event: StorageEvent) {
            if (event.key === storageKey) {
                onChange();
            }
        }

        listeners.add(onChange);
        window.addEventListener("storage", handleStorage);
        return () => {
            listeners.delete(onChange);
            window.removeEventListener("storage", handleStorage);
        };
    }

    return {
        storageKey,
        defaultValue,
        options: Object.entries<string>(titles).map(([value, title]) => ({ value, title })),
        get,
        store,
        storeForFrame,
        subscribe,
        useValue: () => useSyncExternalStore(subscribe, get),
    };
}
