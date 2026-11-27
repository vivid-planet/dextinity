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

function hasSize(rect: FrameRect) {
    return rect.width > 0 && rect.height > 0;
}

/**
 * The element's box in the frame's pixels, or the box around its contents when it has none of its own, e.g. with `display: contents`,
 * like an `Input` in a `Field`. `null` when neither has a size.
 */
export function getRenderedFrameRect(element: Element): FrameRect | null {
    const ownRect = getFrameRect(element);
    if (hasSize(ownRect)) {
        return ownRect;
    }
    const contents = element.ownerDocument.createRange();
    contents.selectNodeContents(element);
    const { top, left, width, height } = contents.getBoundingClientRect();
    const contentsRect = { top, left, width, height };
    return hasSize(contentsRect) ? contentsRect : null;
}

/**
 * How far to move a label from where it is anchored, at `anchorLeft` in a frame of `frameWidth`, to come as close to
 * `preferredOffset` as it can while it stays inside the frame. A label wider than the frame starts at the frame's left edge.
 */
export function getLabelOffset({
    preferredOffset,
    anchorLeft,
    labelWidth,
    frameWidth,
}: {
    preferredOffset: number;
    anchorLeft: number;
    labelWidth: number;
    frameWidth: number;
}): number {
    return Math.max(Math.min(preferredOffset, frameWidth - anchorLeft - labelWidth), -anchorLeft);
}

/** The document the frame shows, again after each load. */
export function useFrameDocument(frameRef: RefObject<HTMLIFrameElement | null>, frameLoadCount: number) {
    const [frameDocument, setFrameDocument] = useState<Document | null>(null);
    useEffect(() => {
        setFrameDocument(frameRef.current?.contentDocument ?? null);
    }, [frameRef, frameLoadCount]);
    return frameDocument;
}
