const storageKey = "scrollPositions";

const scrollPositions = new Map<string, number>();

export type HistoryState = { key: string };

export function createHistoryState(): HistoryState {
    return { key: crypto.getRandomValues(new Uint32Array(2)).join("-") };
}

export function getHistoryKey(state: unknown): string | undefined {
    if (typeof state === "object" && state !== null && "key" in state && typeof state.key === "string") {
        return state.key;
    }
    return undefined;
}

export function rememberScrollPosition(key: string, scrollY: number) {
    scrollPositions.set(key, scrollY);
}

export function getRememberedScrollPosition(key: string) {
    return scrollPositions.get(key);
}

/**
 * Keeps the scroll positions when the page is reloaded, the browser doesn't restore them with `history.scrollRestoration = "manual"`
 */
export function persistScrollPositions() {
    try {
        sessionStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(scrollPositions)));
    } catch {
        // Storage is unavailable, e.g., in private mode or when blocked by the user
    }
}

export function loadPersistedScrollPositions() {
    try {
        const persisted: unknown = JSON.parse(sessionStorage.getItem(storageKey) ?? "{}");
        if (typeof persisted !== "object" || persisted === null) {
            return;
        }
        for (const [key, scrollY] of Object.entries(persisted)) {
            if (typeof scrollY === "number") {
                scrollPositions.set(key, scrollY);
            }
        }
    } catch {
        // Storage is unavailable or contains invalid JSON
    }
}
