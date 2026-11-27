import { type RefObject, useLayoutEffect } from "react";

const shortViewportQuery = "(max-height: 30rem)";

// The element that `position: sticky` sticks the toolbar and header to, or `null` for the window
function getScrollContainer(root: HTMLElement) {
    const { body, documentElement } = root.ownerDocument;
    for (
        let ancestor = root.parentElement;
        ancestor != null && ancestor !== body && ancestor !== documentElement;
        ancestor = ancestor.parentElement
    ) {
        const { overflowX, overflowY } = getComputedStyle(ancestor);
        if ([overflowX, overflowY].some((overflow) => overflow !== "visible" && overflow !== "clip")) {
            return ancestor;
        }
    }
    return null;
}

interface UseStickyHeaderOptions {
    rootRef: RefObject<HTMLElement | null>;
    toolbarRef: RefObject<HTMLElement | null>;
    tableRef: RefObject<HTMLTableElement | null>;
    stickyHeader: boolean;
    stickyToolbar: boolean;
    overflowing: boolean;
}

/**
 * Measures the sticky toolbar and header into `--_toolbar-height` and `--_header-height` on the root, which the header's sticky
 * position and the scroll margins of the rows read, and sets `data-toolbarstuck` and `data-headerstuck` on the root while they are
 * held in place. They stick to the nearest scroll container around the table, or to the window. While the table scrolls
 * horizontally, its own scrolling area keeps the header from sticking to that container, so this moves the header with the
 * container's scroll through `--_header-shift` on the header.
 */
export function useStickyHeader({ rootRef, toolbarRef, tableRef, stickyHeader, stickyToolbar, overflowing }: UseStickyHeaderOptions) {
    useLayoutEffect(() => {
        const root = rootRef.current;
        const toolbar = toolbarRef.current;
        const table = tableRef.current;
        if (
            root == null ||
            table == null ||
            (!stickyHeader && !stickyToolbar) ||
            typeof ResizeObserver === "undefined" ||
            typeof window.matchMedia === "undefined"
        ) {
            return;
        }
        const shortViewport = window.matchMedia(shortViewportQuery);
        let scrollContainer: HTMLElement | null = null;
        // Sticky elements keep clear of the container's padding
        let scrollContainerInset = 0;

        const updateShift = () => {
            const header = table.tHead;
            const headerHeight = header?.getBoundingClientRect().height ?? 0;
            const stickyTop = parseFloat(getComputedStyle(table).scrollMarginTop) || 0;
            const containerTop = scrollContainer != null ? scrollContainer.getBoundingClientRect().top + scrollContainerInset : 0;
            const tableRect = table.getBoundingClientRect();
            const shift = shortViewport.matches
                ? 0
                : Math.min(Math.max(0, containerTop + stickyTop - tableRect.top), Math.max(0, tableRect.height - headerHeight));
            root.toggleAttribute("data-toolbarstuck", stickyToolbar && shift > 0);
            root.toggleAttribute("data-headerstuck", stickyHeader && shift > 0);
            if (stickyHeader && overflowing && shift > 0) {
                header?.style.setProperty("--_header-shift", `${shift}px`);
            } else {
                header?.style.removeProperty("--_header-shift");
            }
        };
        const measure = () => {
            scrollContainer = getScrollContainer(root);
            scrollContainerInset =
                scrollContainer != null ? scrollContainer.clientTop + (parseFloat(getComputedStyle(scrollContainer).paddingTop) || 0) : 0;
            if (stickyHeader) {
                root.style.setProperty("--_header-height", `${table.tHead?.getBoundingClientRect().height ?? 0}px`);
            }
            if (stickyToolbar && toolbar != null) {
                root.style.setProperty("--_toolbar-height", `${toolbar.getBoundingClientRect().height}px`);
            }
            updateShift();
        };

        const resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(table);
        if (toolbar != null) {
            resizeObserver.observe(toolbar);
        }
        measure();
        shortViewport.addEventListener("change", updateShift);
        // Capture also catches the scrolling of a scroll container around the table. Browsers scroll on the compositor and fire `scroll`
        // after painting the scrolled frame, so while the columns overflow, the shifted header lags behind fast scrolling
        document.addEventListener("scroll", updateShift, { capture: true, passive: true });
        window.addEventListener("resize", updateShift);
        return () => {
            resizeObserver.disconnect();
            shortViewport.removeEventListener("change", updateShift);
            document.removeEventListener("scroll", updateShift, { capture: true });
            window.removeEventListener("resize", updateShift);
            root.style.removeProperty("--_toolbar-height");
            root.style.removeProperty("--_header-height");
            root.removeAttribute("data-toolbarstuck");
            root.removeAttribute("data-headerstuck");
            table.tHead?.style.removeProperty("--_header-shift");
        };
    }, [rootRef, toolbarRef, tableRef, stickyHeader, stickyToolbar, overflowing]);
}
