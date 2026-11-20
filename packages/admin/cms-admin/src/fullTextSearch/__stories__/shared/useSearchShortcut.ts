import { useEffect } from "react";

export function useSearchShortcut(onTrigger: () => void) {
    useEffect(() => {
        const handleKeyDown = (event: globalThis.KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                onTrigger();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onTrigger]);
}

export function isMacPlatform() {
    return typeof navigator !== "undefined" && /mac|iphone|ipad/i.test(navigator.userAgent);
}
