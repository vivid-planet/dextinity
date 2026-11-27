import { type RefObject, useEffect, useState } from "react";

/**
 * Where an element sits in its document, as the child positions from `body` down. Frames that show the same page at the same size
 * have the same structure, so the path finds the same element in another frame, or in the same frame after a reload.
 */
export function getElementPath(element: Element): number[] {
    const path: number[] = [];
    let current: Element | null = element;
    while (current && current !== current.ownerDocument.body) {
        const parent: Element | null = current.parentElement;
        if (!parent) {
            return [];
        }
        path.unshift(Array.prototype.indexOf.call(parent.children, current));
        current = parent;
    }
    return path;
}

export function findElementByPath(frameDocument: Document, path: number[]): Element | null {
    let current: Element | null = frameDocument.body;
    for (const index of path) {
        current = current?.children[index] ?? null;
    }
    return current;
}

/** The id of the story the frame's document shows, or `null` for a document no longer shown, e.g. of a frame that was replaced. */
export function getFrameStoryId(frameDocument: Pick<Document, "location">) {
    return frameDocument.location ? new URLSearchParams(frameDocument.location.search).get("id") : null;
}

/** The element's box in the frame's pixels, which the workspace scales with the frame. */
export function getFrameRect(element: Element) {
    const { top, left, width, height } = element.getBoundingClientRect();
    return { top, left, width, height };
}

export type FrameRect = ReturnType<typeof getFrameRect>;

/** The document the frame shows, again after each load. */
export function useFrameDocument(frameRef: RefObject<HTMLIFrameElement | null>, frameLoadCount: number) {
    const [frameDocument, setFrameDocument] = useState<Document | null>(null);
    useEffect(() => {
        setFrameDocument(frameRef.current?.contentDocument ?? null);
    }, [frameRef, frameLoadCount]);
    return frameDocument;
}
