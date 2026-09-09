import { useEffect, useState } from "react";

const listeners: Set<(isScrolledToPageBottom: boolean) => void> = new Set();
let isScrolledToPageBottom = false;

function measure() {
    return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;
}

function check() {
    const next = measure();
    if (next === isScrolledToPageBottom) {
        return;
    }
    isScrolledToPageBottom = next;
    listeners.forEach((cb) => cb(next));
}

/**
 * Whether the document is scrolled all the way down. One listener is shared by all subscribers.
 */
export function useScrolledToPageBottom() {
    const [scrolledToPageBottom, setScrolledToPageBottom] = useState(false);

    useEffect(() => {
        if (listeners.size === 0) {
            window.addEventListener("scroll", check, { passive: true });
            window.addEventListener("resize", check);
        }
        listeners.add(setScrolledToPageBottom);

        // check() only notifies on change, so seed this subscriber with the current value.
        isScrolledToPageBottom = measure();
        setScrolledToPageBottom(isScrolledToPageBottom);

        return () => {
            listeners.delete(setScrolledToPageBottom);
            if (listeners.size === 0) {
                window.removeEventListener("scroll", check);
                window.removeEventListener("resize", check);
                isScrolledToPageBottom = false;
            }
        };
    }, []);

    return scrolledToPageBottom;
}
