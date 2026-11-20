import { type RefObject, useEffect, useRef, useState } from "react";

import { findComponentWithStory } from "./componentStories";

export interface InspectedComponent {
    componentName: string;
    storyId: string;
    /** The component's box in the frame's own pixels, before the canvas zoom. */
    rect: { top: number; left: number; width: number; height: number };
}

// Swallowed while inspecting, so pointing at the page doesn't also press its buttons, open its menus, or show its hover states
const blockedEvents = [
    "pointerdown",
    "mousedown",
    "pointerup",
    "mouseup",
    "dblclick",
    "contextmenu",
    "pointerover",
    "pointerout",
    "pointerenter",
    "mouseover",
    "mouseout",
    "mousemove",
] as const;

// The frame's elements come from another window, so `instanceof Element` of this one doesn't recognize them
function asElement(target: EventTarget | null): Element | null {
    return target != null && (target as Node).nodeType === Node.ELEMENT_NODE ? (target as Element) : null;
}

/**
 * While `active`, turns the frame's page into a picker: the component under the pointer is reported for highlighting, and a click
 * calls `onPick` with it instead of reaching the page. Escape calls `onExit`.
 */
export function useCanvasInspector({
    frameRef,
    active,
    frameLoadCount,
    componentStoryIds,
    onPick,
    onExit,
}: {
    frameRef: RefObject<HTMLIFrameElement | null>;
    active: boolean;
    /** Changes whenever the frame loads another document, which needs the listeners again. */
    frameLoadCount: number;
    componentStoryIds: Map<string, string>;
    onPick: (component: InspectedComponent) => void;
    onExit: () => void;
}): InspectedComponent | null {
    const [hovered, setHovered] = useState<InspectedComponent | null>(null);
    // The latest callbacks, so passing new functions on each render doesn't attach the listeners again
    const callbacks = useRef({ onPick, onExit });
    useEffect(() => {
        callbacks.current = { onPick, onExit };
    });

    useEffect(() => {
        const frameDocument = frameRef.current?.contentDocument;
        const frameRoot = frameDocument?.documentElement;
        if (!active || !frameDocument || !frameRoot) {
            setHovered(null);
            return;
        }
        const inspectedDocument: Document = frameDocument;

        const frameWindow = frameDocument.defaultView;
        let pointer: { x: number; y: number } | null = null;

        function inspect(target: EventTarget | null) {
            const found = findComponentWithStory(asElement(target), componentStoryIds);
            if (!found) {
                setHovered(null);
                return undefined;
            }
            const box = found.element.getBoundingClientRect();
            const inspected = {
                componentName: found.componentName,
                storyId: found.storyId,
                rect: { top: box.top, left: box.left, width: box.width, height: box.height },
            };
            setHovered(inspected);
            return inspected;
        }

        // After a scroll or resize, a different component may be under the pointer that hasn't moved
        function inspectUnderPointer() {
            if (pointer) {
                inspect(inspectedDocument.elementFromPoint(pointer.x, pointer.y));
            }
        }

        // Only the user's own input picks: a story's play function also clicks, and its clicks mustn't navigate away
        function handlePointerMove(event: PointerEvent) {
            if (event.isTrusted) {
                pointer = { x: event.clientX, y: event.clientY };
                inspect(event.target);
            }
        }

        function handlePointerLeave(event: PointerEvent) {
            if (event.target === frameRoot) {
                pointer = null;
                setHovered(null);
            }
        }

        function handleClick(event: MouseEvent) {
            if (!event.isTrusted) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            const inspected = inspect(event.target);
            if (inspected) {
                callbacks.current.onPick(inspected);
            }
        }

        function blockEvent(event: Event) {
            if (event.isTrusted) {
                event.preventDefault();
                event.stopPropagation();
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                callbacks.current.onExit();
            }
        }

        const cursorStyle = frameDocument.createElement("style");
        cursorStyle.textContent = "*, *::before, *::after { cursor: crosshair !important; }";
        frameDocument.head.append(cursorStyle);

        frameDocument.addEventListener("pointermove", handlePointerMove, true);
        frameDocument.addEventListener("click", handleClick, true);
        frameDocument.addEventListener("pointerleave", handlePointerLeave, true);
        frameDocument.addEventListener("scroll", inspectUnderPointer, true);
        frameWindow?.addEventListener("resize", inspectUnderPointer);
        frameDocument.addEventListener("keydown", handleKeyDown, true);
        window.addEventListener("keydown", handleKeyDown);
        for (const type of blockedEvents) {
            frameDocument.addEventListener(type, blockEvent, true);
        }

        return () => {
            cursorStyle.remove();
            frameDocument.removeEventListener("pointermove", handlePointerMove, true);
            frameDocument.removeEventListener("click", handleClick, true);
            frameDocument.removeEventListener("pointerleave", handlePointerLeave, true);
            frameDocument.removeEventListener("scroll", inspectUnderPointer, true);
            frameWindow?.removeEventListener("resize", inspectUnderPointer);
            frameDocument.removeEventListener("keydown", handleKeyDown, true);
            window.removeEventListener("keydown", handleKeyDown);
            for (const type of blockedEvents) {
                frameDocument.removeEventListener(type, blockEvent, true);
            }
            setHovered(null);
        };
    }, [frameRef, active, frameLoadCount, componentStoryIds]);

    return hovered;
}
