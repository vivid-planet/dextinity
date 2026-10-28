import { useEffect, useState } from "react";

interface WindowSize {
    width: number;
    height: number;
}

const listeners: Set<(windowSize: WindowSize) => void> = new Set();
let windowSize: WindowSize | undefined;

function measure(): WindowSize {
    return { width: window.innerWidth, height: window.innerHeight };
}

function handleResize() {
    const next = measure();
    // The mobile URL bar collapses during normal scrolling, so resize fires without the size actually changing.
    // Publishing a new object regardless would invalidate every subscriber's effects.
    if (windowSize && next.width === windowSize.width && next.height === windowSize.height) {
        return;
    }
    windowSize = next;
    listeners.forEach((cb) => cb(next));
}

/**
 * The current viewport size, measured once and shared by all subscribers.
 */
export const useWindowSize = (): WindowSize | undefined => {
    const [size, setSize] = useState<WindowSize>();

    useEffect(() => {
        if (listeners.size === 0) {
            window.addEventListener("resize", handleResize);
        }
        listeners.add(setSize);

        // handleResize() only notifies on change, so seed this subscriber with the current value.
        windowSize ??= measure();
        setSize(windowSize);

        return () => {
            listeners.delete(setSize);
            if (listeners.size === 0) {
                window.removeEventListener("resize", handleResize);
                windowSize = undefined;
            }
        };
    }, []);

    return size;
};
