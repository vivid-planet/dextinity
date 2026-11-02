import { type RefObject, useCallback } from "react";
import { useDragDropManager } from "react-dnd";
import type { ListImperativeAPI } from "react-window";

import ScrollManager from "./ScrollManager";
import useAnimationFrame from "./useAnimationFrame";

export function useDndWindowScroll(listRef: RefObject<ListImperativeAPI | null>): void {
    const ddm = useDragDropManager();

    // Manipulating the dom directly with dom-api
    // Changes the scroll position on every frame, when the drag-onject is over or below the virtual-list-element
    // Scrolling-velocity varies with the distance of the dragged-object to virtual-list-element
    const handleListScroll = useCallback(() => {
        const monitor = ddm.getMonitor();

        // Is the user dragging an object?
        const isDragging = monitor && monitor.getClientOffset() ? true : false; // monitor.isDragging() does not return relyable results, indicating dragging by asking for the client-offset works

        const listElement = listRef.current?.element;
        if (listElement && monitor && isDragging) {
            const scrollCommand = ScrollManager.getScrollCommand(listElement, monitor.getClientOffset()?.y || 0);
            if (scrollCommand) {
                const offset = listElement.scrollTop;
                const nextOffset =
                    scrollCommand.direction === "backward"
                        ? Math.max(offset - scrollCommand.distance, 0)
                        : Math.min(offset + scrollCommand.distance, Number.MAX_SAFE_INTEGER); // @TODO: replace Number.MAX_SAFE_INTEGER with the height of the virtual-list
                if (nextOffset !== offset) {
                    listElement.scrollTo({ behavior: "auto", left: 0, top: nextOffset });
                }
            }
        }
    }, [ddm, listRef]); // ddm and listRef are references themselves, that's why we could also omit these dependencies

    // Call handleListScroll on every frame
    useAnimationFrame(handleListScroll);
}
