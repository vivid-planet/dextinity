import { type RefObject, useLayoutEffect, useState } from "react";

/**
 * Whether the table is wider than its scroll container, so people scroll it horizontally.
 */
export function useOverflowing(scrollerRef: RefObject<HTMLElement | null>, tableRef: RefObject<HTMLElement | null>) {
    const [overflowing, setOverflowing] = useState(false);

    useLayoutEffect(() => {
        const scroller = scrollerRef.current;
        const table = tableRef.current;
        if (scroller == null || table == null || typeof ResizeObserver === "undefined") {
            return;
        }
        const update = () => setOverflowing(table.offsetWidth > scroller.clientWidth);
        const resizeObserver = new ResizeObserver(update);
        update();
        resizeObserver.observe(scroller);
        resizeObserver.observe(table);
        return () => resizeObserver.disconnect();
    }, [scrollerRef, tableRef]);

    return overflowing;
}
