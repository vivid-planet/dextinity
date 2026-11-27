import { type RefObject, useEffect, useRef, useState } from "react";

import { type ComponentLevel, findComponentChain, getLevelAfterMove } from "./componentStories";
import { toolAttribute } from "./hotspots";

export interface InspectedComponent {
    componentName: string;
    storyId: string;
    /** The component's box in the frame's own pixels, before the canvas zoom. */
    rect: { top: number; left: number; width: number; height: number };
}

/** The highlighted component and the components with a story it sits in, for showing the levels a click can pick. */
export interface InspectedChain {
    /** The components with a story under the pointer, outermost first. */
    levels: Array<{ key: string; componentName: string }>;
    /** The index in `levels` of the highlighted component, the one a click picks. */
    level: number;
    component: InspectedComponent;
    /** The width of the frame's page in its own pixels, before the canvas zoom. */
    frameWidth: number;
}

// Move the highlight to the enclosing component and back without moving the pointer
const enclosingKeys = new Set(["ArrowUp", "["]);
const innerKeys = new Set(["ArrowDown", "]"]);

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

function isTyping(target: EventTarget | null) {
    const element = asElement(target);
    return element?.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])") != null;
}

// The frame's elements come from another window, so `instanceof Element` of this one doesn't recognize them
function asElement(target: EventTarget | null): Element | null {
    return target != null && (target as Node).nodeType === Node.ELEMENT_NODE ? (target as Element) : null;
}

/**
 * While `active`, turns the frame's page into a picker: the innermost component with a story under the pointer is reported for
 * highlighting, and a click calls `onPick` with it instead of reaching the page. ArrowUp or `[` moves the highlight to the enclosing
 * component, ArrowDown or `]` back in. Escape calls `onExit`.
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
}): InspectedChain | null {
    const [hovered, setHovered] = useState<InspectedChain | null>(null);
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

        // The same component name can come twice in a chain, e.g. a `Stack` in a `Stack`, so the element tells the levels apart
        const elementKeys = new WeakMap<Element, number>();
        let nextElementKey = 0;
        function getElementKey(element: Element) {
            let key = elementKeys.get(element);
            if (key == null) {
                key = nextElementKey++;
                elementKeys.set(element, key);
            }
            return key;
        }

        let chain: ComponentLevel[] = [];
        let level = -1;

        function showLevel() {
            const selected = chain.at(level);
            if (!selected) {
                setHovered(null);
                return undefined;
            }
            const box = selected.element.getBoundingClientRect();
            const component = {
                componentName: selected.componentName,
                storyId: selected.storyId,
                rect: { top: box.top, left: box.left, width: box.width, height: box.height },
            };
            const levels = chain.map(({ element, componentName }) => ({ key: `${getElementKey(element)}-${componentName}`, componentName }));
            setHovered({ levels, level, component, frameWidth: inspectedDocument.documentElement.clientWidth });
            return component;
        }

        function inspect(target: EventTarget | null) {
            const nextChain = findComponentChain(asElement(target), componentStoryIds);
            level = getLevelAfterMove(chain, level, nextChain);
            chain = nextChain;
            return showLevel();
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
                chain = [];
                level = -1;
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

        function handleLevelKey(event: KeyboardEvent) {
            if (pointer == null || chain.length === 0 || event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) {
                return;
            }
            const step = enclosingKeys.has(event.key) ? -1 : innerKeys.has(event.key) ? 1 : 0;
            if (step === 0) {
                return;
            }
            // Not scrolling the page as well
            event.preventDefault();
            event.stopPropagation();
            level = Math.min(Math.max(level + step, 0), chain.length - 1);
            showLevel();
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
        // Before a list of the workspace that has the focus uses the arrow keys
        frameDocument.addEventListener("keydown", handleLevelKey, true);
        window.addEventListener("keydown", handleLevelKey, true);
        for (const type of blockedEvents) {
            frameDocument.addEventListener(type, blockEvent, true);
        }

        frameRoot.setAttribute(toolAttribute, "pick");

        return () => {
            frameRoot.removeAttribute(toolAttribute);
            cursorStyle.remove();
            frameDocument.removeEventListener("pointermove", handlePointerMove, true);
            frameDocument.removeEventListener("click", handleClick, true);
            frameDocument.removeEventListener("pointerleave", handlePointerLeave, true);
            frameDocument.removeEventListener("scroll", inspectUnderPointer, true);
            frameWindow?.removeEventListener("resize", inspectUnderPointer);
            frameDocument.removeEventListener("keydown", handleKeyDown, true);
            window.removeEventListener("keydown", handleKeyDown);
            frameDocument.removeEventListener("keydown", handleLevelKey, true);
            window.removeEventListener("keydown", handleLevelKey, true);
            for (const type of blockedEvents) {
                frameDocument.removeEventListener(type, blockEvent, true);
            }
            setHovered(null);
        };
    }, [frameRef, active, frameLoadCount, componentStoryIds]);

    return hovered;
}
