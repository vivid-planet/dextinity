import { type CSSProperties, type RefObject, useLayoutEffect, useState } from "react";

const minWindowHeight = 460;

/**
 * Lets the finder window of a `FinderLayout` reach down to the bottom of the viewport, whatever the header and the app shell above it
 * take. Returns the style for the layout's root, which sets the window height token.
 */
export function useDamFinderWindowHeight({
    layoutRef,
    windowContentRef,
}: {
    layoutRef: RefObject<HTMLElement | null>;
    windowContentRef: RefObject<HTMLElement | null>;
}): CSSProperties | undefined {
    const [offset, setOffset] = useState<number>();

    useLayoutEffect(() => {
        const layout = layoutRef.current;
        const windowContent = windowContentRef.current;
        if (layout == null || windowContent == null) {
            return;
        }
        const measure = () => {
            const top = windowContent.getBoundingClientRect().top + window.scrollY;
            const appShellMain = windowContent.closest("main");
            // The space the app shell keeps below its content, so that the page doesn't scroll
            const bottomSpacing = appShellMain != null ? parseFloat(getComputedStyle(appShellMain).paddingBottom) || 0 : 0;
            setOffset(Math.round(top + bottomSpacing));
        };
        measure();
        const resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(layout);
        window.addEventListener("resize", measure);
        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, [layoutRef, windowContentRef]);

    if (offset == null) {
        return undefined;
    }
    return { ["--dextinity-finder-layout-window-height" as string]: `max(${minWindowHeight}px, calc(100dvh - ${offset}px))` };
}
