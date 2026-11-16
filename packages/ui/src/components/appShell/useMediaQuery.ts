import { useCallback, useSyncExternalStore } from "react";

function getServerSnapshot() {
    return false;
}

/**
 * Whether the window matches a media query, updated when it changes. On the server and while hydrating it is `false`, so
 * the wide layout renders first.
 */
export function useMediaQuery(query: string) {
    const subscribe = useCallback(
        (onChange: () => void) => {
            const mediaQueryList = window.matchMedia(query);
            mediaQueryList.addEventListener("change", onChange);
            return () => mediaQueryList.removeEventListener("change", onChange);
        },
        [query],
    );
    const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
