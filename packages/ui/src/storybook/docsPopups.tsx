import type { Decorator } from "@storybook/react-vite";
import { type PropsWithChildren, useLayoutEffect, useRef, useState } from "react";

import styles from "./docsPopups.module.scss";

type PopupSide = "below" | "above";

/**
 * Set as `parameters.popupRoom` on a story whose popup opens above its trigger, e.g. a menu in a bar at the bottom of the page.
 * The docs page then makes the room for the popup above the story, so the popup opens on the same side as in the app instead of
 * flipping below. Popups that open below need no parameter: {@link DocsPopupRoom} measures every popup when it opens.
 */
interface PopupRoom {
    side: PopupSide;
}

// Storybook's `Parameters` type accepts anything, so a mistyped value would otherwise leave the popup on the wrong side without a hint why
function parsePopupRoom(popupRoom: unknown, storyId: string): PopupRoom {
    if (typeof popupRoom === "object" && popupRoom !== null) {
        const { side, ...rest } = popupRoom as Record<string, unknown>;
        if ((side === "below" || side === "above") && Object.keys(rest).length === 0) {
            return { side };
        }
    }
    throw new Error(`Story "${storyId}" sets \`parameters.popupRoom\` to ${JSON.stringify(popupRoom)}; expected { side: "below" | "above" }.`);
}

// Matches the `collisionPadding` of the library's popups, so a popup that fits has this much room left to the frame's edge
const popupEdgeGap = 8;

interface ExtraRoom {
    above: number;
    below: number;
}

/**
 * The closest ancestor that cuts off what overflows it: on a docs page, the story's frame.
 */
export function findClippingFrame(element: HTMLElement): HTMLElement | null {
    for (let ancestor = element.parentElement; ancestor !== null; ancestor = ancestor.parentElement) {
        if (getComputedStyle(ancestor).overflowY !== "visible") {
            return ancestor;
        }
    }
    return null;
}

function findFixedAncestor(element: HTMLElement, root: HTMLElement): HTMLElement | null {
    for (let ancestor: HTMLElement | null = element; ancestor !== null && ancestor !== root; ancestor = ancestor.parentElement) {
        if (getComputedStyle(ancestor).position === "fixed") {
            return ancestor;
        }
    }
    return null;
}

/**
 * The popups open in `root`: the positioners of anchored popups — menus, options, calendars, tooltips — and the surfaces of modal
 * overlays, e.g. a dialog or a drawer, each with the fixed overlay it is centered or docked in.
 */
export function findOpenPopups(root: HTMLElement) {
    const anchored = [...root.querySelectorAll<HTMLElement>("[data-side]")].filter((element) => {
        const { position } = getComputedStyle(element);
        return (position === "absolute" || position === "fixed") && element.offsetHeight > 0 && !element.parentElement?.closest("[data-side]");
    });
    const overlays: Array<{ surface: HTMLElement; overlay: HTMLElement }> = [];
    for (const surface of root.querySelectorAll<HTMLElement>("[role='dialog'], [role='alertdialog']")) {
        const overlay = findFixedAncestor(surface, root);
        if (overlay !== null && surface.offsetHeight > 0 && surface.closest("[data-side]") === null) {
            overlays.push({ surface, overlay });
        }
    }
    return { anchored, overlays };
}

function scrolledAwayHeight(element: HTMLElement, isShrunk: (style: CSSStyleDeclaration) => boolean) {
    let shrunkHeight = 0;
    for (const scroller of [element, ...element.querySelectorAll<HTMLElement>("*")]) {
        const style = getComputedStyle(scroller);
        const scrolledAway = scroller.scrollHeight - scroller.clientHeight;
        if (scrolledAway > 1 && style.overflowY !== "visible" && isShrunk(style)) {
            shrunkHeight = Math.max(shrunkHeight, scrolledAway);
        }
    }
    return shrunkHeight;
}

/**
 * The part of an anchored popup that is scrolled away because the popup was shrunk to `--available-height`, the room its
 * positioner found. A popup that scrolls because of its own max height, e.g. a long option list, isn't counted.
 */
export function shrunkAnchoredPopupHeight(positioner: HTMLElement) {
    const availableHeight = parseFloat(getComputedStyle(positioner).getPropertyValue("--available-height"));
    if (Number.isNaN(availableHeight)) {
        return 0;
    }
    return scrolledAwayHeight(positioner, (style) => Math.abs(parseFloat(style.maxHeight) - availableHeight) <= 1);
}

/**
 * The height a modal overlay's surface takes without the limits of its overlay: the surface without its max height, and when it
 * then still takes the whole height of its overlay, with its scrolled away part. Doesn't count what scrolls because of its own
 * max height, e.g. the list of a command palette. Lifts the surface's max height for a moment, which changes its `style`.
 */
export function overlaySurfaceHeight(surface: HTMLElement, overlay: HTMLElement) {
    if (surface === overlay) {
        return surface.offsetHeight;
    }
    const maxBlockSize = surface.style.maxBlockSize;
    surface.style.maxBlockSize = "none";
    const height = surface.offsetHeight;
    const scrolledAway = height + 2 * popupEdgeGap < overlay.clientHeight - 1 ? 0 : scrolledAwayHeight(surface, () => true);
    surface.style.maxBlockSize = maxBlockSize;
    return height + scrolledAway;
}

/**
 * Whether the frame is in the window, so that the frame rather than the window limits the popups in it. Where the window cuts a
 * popup off, or made it flip, scrolling the page fixes it, not more room.
 */
export function isFrameInView(frame: HTMLElement) {
    const frameRect = frame.getBoundingClientRect();
    return frameRect.top >= -1 && frameRect.bottom <= window.innerHeight + 1;
}

// The containing block of a fixed overlay when it is in the story rather than the window: on a docs page, Storybook's zoom
// wrapper in the frame
function findOverlayContainingBlock(overlay: HTMLElement, frame: HTMLElement) {
    for (let ancestor = overlay.parentElement; ancestor !== null && ancestor !== frame.parentElement; ancestor = ancestor.parentElement) {
        const style = getComputedStyle(ancestor);
        if (
            style.transform !== "none" ||
            style.filter !== "none" ||
            style.perspective !== "none" ||
            /paint|layout|strict|content/.test(style.contain)
        ) {
            return ancestor;
        }
    }
    return null;
}

// The extra room above and below its content that `room` needs so that the story's frame doesn't cut off or shrink the popups
// open in it. Measured from the room's content rather than from the frame, so measuring again before the popups have moved
// asks for the same room.
function measureNeededRoom(room: HTMLElement, current: ExtraRoom, preferredSide: PopupSide): ExtraRoom {
    const frame = findClippingFrame(room);
    if (frame === null || !isFrameInView(frame)) {
        return current;
    }
    const frameRect = frame.getBoundingClientRect();
    const roomRect = room.getBoundingClientRect();
    const contentTop = roomRect.top + current.above;
    const contentBottom = roomRect.bottom - current.below;
    const needed: ExtraRoom = { above: 0, below: 0 };
    const { anchored, overlays } = findOpenPopups(room);
    for (const positioner of anchored) {
        // Uses the layout height rather than the transformed one, as the popup may still be scaling in
        const top = positioner.getBoundingClientRect().top;
        const bottom = top + positioner.offsetHeight;
        const shrunkHeight = shrunkAnchoredPopupHeight(positioner);
        const height = positioner.offsetHeight + shrunkHeight;
        const fits = shrunkHeight <= 1 && top - popupEdgeGap >= frameRect.top - 1 && bottom + popupEdgeGap <= frameRect.bottom + 1;
        const side = positioner.dataset.side;
        const placedAbove = side === "top";
        if (!fits && placedAbove !== (preferredSide === "above")) {
            // Flipped to the other side for lack of room: makes the most room it could take on the side the story asks for, the
            // whole popup next to the content's edge, so it flips back
            needed[preferredSide] = Math.max(needed[preferredSide], Math.ceil(height + 2 * popupEdgeGap));
        } else if (side !== "bottom" && !placedAbove && preferredSide === "below") {
            // Placed beside its anchor, as a submenu is, or flipped there for lack of room below: makes the room it would take
            // below the anchor, which starts where the popup does
            const anchorHeight = parseFloat(getComputedStyle(positioner).getPropertyValue("--anchor-height")) || 0;
            needed.below = Math.max(needed.below, Math.ceil(top + anchorHeight + height + 2 * popupEdgeGap - contentBottom));
        } else if (placedAbove) {
            needed.above = Math.max(needed.above, Math.ceil(contentTop - (bottom - height - popupEdgeGap)));
        } else {
            needed.below = Math.max(needed.below, Math.ceil(top + height + popupEdgeGap - contentBottom));
        }
    }
    for (const { surface, overlay } of overlays) {
        const containingBlock = findOverlayContainingBlock(overlay, frame);
        if (containingBlock === null) {
            continue;
        }
        if (overlay === surface) {
            // A surface placed on its own, e.g. a command palette at a fixed distance from the top
            needed.below = Math.max(
                needed.below,
                Math.ceil(surface.getBoundingClientRect().top + surface.offsetHeight + popupEdgeGap - contentBottom),
            );
            continue;
        }
        // A surface centered or docked in an overlay that covers the story, e.g. a dialog or a drawer
        const height = overlaySurfaceHeight(surface, overlay);
        // Storybook's zoom wrapper follows the height of the story only a frame later, and the overlay with it
        const storyBottom = [...containingBlock.children].find((child) => child.contains(room))?.getBoundingClientRect().bottom;
        const lag = storyBottom === undefined ? 0 : storyBottom - containingBlock.getBoundingClientRect().bottom;
        const { paddingBlockStart, paddingBlockEnd } = getComputedStyle(overlay);
        const edges = Math.max(popupEdgeGap, parseFloat(paddingBlockStart)) + Math.max(popupEdgeGap, parseFloat(paddingBlockEnd));
        const missing = Math.ceil(height + edges - (overlay.clientHeight + lag - current.above - current.below));
        needed.below = Math.max(needed.below, missing - current.above);
    }
    return needed;
}

/**
 * Grows on docs pages so that the popups opened in it — menus, options, calendars, tooltips, dialogs — aren't cut off or shrunk
 * by the story's frame. Measures every popup when it opens, moves, or finishes its animation, and only ever grows, so the page
 * doesn't jump when the popup closes again.
 */
export function DocsPopupRoom({ children, side = "below" }: PropsWithChildren<{ side?: PopupSide }>) {
    const roomRef = useRef<HTMLDivElement>(null);
    const [extraRoom, setExtraRoom] = useState<ExtraRoom>({ above: 0, below: 0 });
    const extraRoomRef = useRef(extraRoom);

    useLayoutEffect(() => {
        extraRoomRef.current = extraRoom;
    }, [extraRoom]);

    useLayoutEffect(() => {
        const room = roomRef.current;
        if (room === null) {
            return;
        }
        let frameRequest: number | undefined;
        const measure = () => {
            frameRequest = undefined;
            const needed = measureNeededRoom(room, extraRoomRef.current, side);
            // Measuring a surface changes its style for a moment, which isn't a change to measure again for
            observer.takeRecords();
            setExtraRoom((previous) =>
                needed.above > previous.above || needed.below > previous.below
                    ? { above: Math.max(previous.above, needed.above), below: Math.max(previous.below, needed.below) }
                    : previous,
            );
        };
        const scheduleMeasure = () => {
            frameRequest ??= requestAnimationFrame(measure);
        };
        scheduleMeasure();
        const observer = new MutationObserver(scheduleMeasure);
        observer.observe(room, { subtree: true, childList: true, attributes: true, attributeFilter: ["style", "data-side", "data-open"] });
        room.addEventListener("animationend", scheduleMeasure);
        room.addEventListener("transitionend", scheduleMeasure);
        // A popup that opened while the frame was partly out of the window gets its room once the reader scrolls to it
        window.addEventListener("scroll", scheduleMeasure, { capture: true, passive: true });
        return () => {
            observer.disconnect();
            room.removeEventListener("animationend", scheduleMeasure);
            room.removeEventListener("transitionend", scheduleMeasure);
            window.removeEventListener("scroll", scheduleMeasure, { capture: true });
            if (frameRequest !== undefined) {
                cancelAnimationFrame(frameRequest);
            }
        };
    }, [side]);

    useLayoutEffect(() => {
        const room = roomRef.current;
        const frame = room === null ? null : findClippingFrame(room);
        if (frame === null || (extraRoom.above === 0 && extraRoom.below === 0)) {
            return;
        }
        // Popups only re-measure their available room on scroll and resize, not when the frame around them grows. The frame may
        // follow the room's size only a frame later, so this waits for the frame to change size.
        const observer = new ResizeObserver(() => requestAnimationFrame(() => window.dispatchEvent(new Event("resize"))));
        observer.observe(frame);
        return () => observer.disconnect();
    }, [extraRoom]);

    return (
        <div
            ref={roomRef}
            data-docs-popup-room=""
            className={styles.popupRoom}
            style={{ paddingBlockStart: extraRoom.above || undefined, paddingBlockEnd: extraRoom.below || undefined }}
        >
            {children}
        </div>
    );
}

/**
 * On docs pages, renders every story in a {@link DocsPopupRoom}, so its popups get the room they need once they open, on the
 * side `parameters.popupRoom` asks for. The story's own page stays as it is.
 */
export const popupRoomDecorator: Decorator = (Story, { id, parameters, viewMode }) => {
    const popupRoom = parameters.popupRoom === undefined ? undefined : parsePopupRoom(parameters.popupRoom, id);
    if (viewMode !== "docs") {
        return <Story />;
    }
    return (
        <DocsPopupRoom side={popupRoom?.side}>
            <Story />
        </DocsPopupRoom>
    );
};

/**
 * On docs pages, renders a story with `parameters.closedOnDocsPage` with its `open` arg off, so only its trigger shows. A modal
 * overlay that starts open would lock the docs page's scrolling and take the reader's focus as soon as the page loads. The
 * story's own page still starts with the overlay open.
 */
export const closedOnDocsPageDecorator: Decorator = (Story, { args, parameters, viewMode }) => {
    if (viewMode !== "docs" || parameters.closedOnDocsPage !== true) {
        return <Story />;
    }
    return <Story args={{ ...args, open: false }} />;
};
