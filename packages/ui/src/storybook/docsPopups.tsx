import type { Decorator } from "@storybook/react-vite";
import { type PropsWithChildren, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";

import { popupCollisionPadding } from "../utils/popupCollisionPadding";
import styles from "./docsPopups.module.scss";
import { updateStoryArgs } from "./storyArgs";

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
export function parsePopupRoom(popupRoom: unknown, storyId: string): PopupRoom {
    if (typeof popupRoom === "object" && popupRoom !== null) {
        const { side, ...rest } = popupRoom as Record<string, unknown>;
        if ((side === "below" || side === "above") && Object.keys(rest).length === 0) {
            return { side };
        }
    }
    throw new Error(`Story "${storyId}" sets \`parameters.popupRoom\` to ${JSON.stringify(popupRoom)}; expected { side: "below" | "above" }.`);
}

// A popup that fits has this much room left to the frame's edge
const popupEdgeGap = popupCollisionPadding;

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

function scrolledAwayHeight(element: HTMLElement, isShrunk: (scroller: HTMLElement) => boolean) {
    let shrunkHeight = 0;
    for (const scroller of [element, ...element.querySelectorAll<HTMLElement>("*")]) {
        const scrolledAway = scroller.scrollHeight - scroller.clientHeight;
        if (scrolledAway > 1 && getComputedStyle(scroller).overflowY !== "visible" && isShrunk(scroller)) {
            shrunkHeight = Math.max(shrunkHeight, scrolledAway);
        }
    }
    return shrunkHeight;
}

/**
 * The part of an anchored popup that is scrolled away because the popup was shrunk to `--available-height`, the room its
 * positioner found: a part of it that scrolls, in an element held at that height, e.g. the option list in a select's popup. A
 * popup that scrolls because of its own max height, e.g. a long option list, isn't counted.
 */
export function shrunkAnchoredPopupHeight(positioner: HTMLElement) {
    const availableHeight = parseFloat(getComputedStyle(positioner).getPropertyValue("--available-height"));
    if (Number.isNaN(availableHeight)) {
        return 0;
    }
    const isHeldAtAvailableHeight = (element: HTMLElement) =>
        Math.abs(parseFloat(getComputedStyle(element).maxHeight) - availableHeight) <= 1 && element.offsetHeight >= availableHeight - 1;
    return scrolledAwayHeight(positioner, (scroller) => {
        for (let element: HTMLElement | null = scroller; element !== null; element = element.parentElement) {
            if (isHeldAtAvailableHeight(element)) {
                return true;
            }
            if (element === positioner) {
                return false;
            }
        }
        return false;
    });
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

interface Range {
    top: number;
    bottom: number;
}

function unite(range: Range | null, other: Range): Range {
    return range === null ? other : { top: Math.min(range.top, other.top), bottom: Math.max(range.bottom, other.bottom) };
}

/**
 * How far to scroll the page so that `range` is in the window, keeping its top edge in the window when it doesn't fit, and its
 * bottom edge when it is above the window. Positive scrolls down.
 */
function scrollToReveal({ top, bottom }: Range) {
    if (bottom > window.innerHeight) {
        return Math.max(0, Math.min(bottom - window.innerHeight, top));
    }
    if (top < 0) {
        return Math.min(0, Math.max(top, bottom - window.innerHeight));
    }
    return 0;
}

interface NeededRoom extends ExtraRoom {
    // The part of the window, by popup, that a popup the frame or the window limits needs to open as it does in the app. Only
    // for a popup whose anchor is in the window, as the reader can't have opened one whose anchor isn't.
    reveal: Map<HTMLElement, Range>;
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

// Whether a popup was placed beside its anchor because the frame, not the window, left no room above or below it: the side
// the popup prefers is above or below, unless it opens from another popup, as a submenu does
function isPushedBesideByFrame(positioner: HTMLElement, anchored: HTMLElement[], anchor: Range, frameRect: DOMRect) {
    const opensFromAnotherPopup = anchored.some((other) => other !== positioner && other.querySelector("[aria-expanded='true']") !== null);
    if (opensFromAnotherPopup) {
        return false;
    }
    const neededHeight = positioner.offsetHeight + shrunkAnchoredPopupHeight(positioner) + 3 * popupEdgeGap;
    const fitsInWindowOnly = (roomInWindow: number, roomInFrame: number) => roomInWindow >= neededHeight && roomInFrame < neededHeight;
    return (
        fitsInWindowOnly(anchor.top, anchor.top - frameRect.top) ||
        fitsInWindowOnly(window.innerHeight - anchor.bottom, frameRect.bottom - anchor.bottom)
    );
}

// The extra room above and below its content that `room` needs so that the story's frame doesn't cut off or shrink the popups
// open in it. Measured from the room's content rather than from the frame, so measuring again before the popups have moved
// asks for the same room. Measures also while the frame is partly out of the window: a popup next to the window's edge flips
// or shrinks against the frame on the other side.
function measureNeededRoom(room: HTMLElement, current: ExtraRoom, preferredSide: PopupSide): NeededRoom {
    const needed: NeededRoom = { above: 0, below: 0, reveal: new Map() };
    const frame = findClippingFrame(room);
    if (frame === null) {
        return needed;
    }
    const frameRect = frame.getBoundingClientRect();
    const roomRect = room.getBoundingClientRect();
    const contentTop = roomRect.top + current.above;
    const contentBottom = roomRect.bottom - current.below;
    const { anchored, overlays } = findOpenPopups(room);
    for (const positioner of anchored) {
        // Uses the layout height rather than the transformed one, as the popup may still be scaling in
        const top = positioner.getBoundingClientRect().top;
        const bottom = top + positioner.offsetHeight;
        const shrunkHeight = shrunkAnchoredPopupHeight(positioner);
        const height = positioner.offsetHeight + shrunkHeight;
        const side = positioner.dataset.side;
        const placedAbove = side === "top";
        const placedBeside = side === "left" || side === "right";
        const anchorHeight = parseFloat(getComputedStyle(positioner).getPropertyValue("--anchor-height")) || 0;
        // Where the anchor is, give or take the popup's offset to it, which is at most the gap
        const anchorTop = placedAbove ? bottom : side === "bottom" ? top - anchorHeight : top;
        const fits =
            shrunkHeight <= 1 &&
            top - popupEdgeGap >= frameRect.top - 1 &&
            bottom + popupEdgeGap <= frameRect.bottom + 1 &&
            !(placedBeside && isPushedBesideByFrame(positioner, anchored, { top: anchorTop, bottom: anchorTop + anchorHeight }, frameRect));
        if (fits) {
            continue;
        }
        if (anchorTop >= 0 && anchorTop + anchorHeight <= window.innerHeight) {
            // The anchor and the popup on the side the story asks for, with room for the offset on both ends of the anchor
            needed.reveal.set(
                positioner,
                preferredSide === "below"
                    ? { top: anchorTop - 2 * popupEdgeGap, bottom: anchorTop + anchorHeight + height + 3 * popupEdgeGap }
                    : { top: anchorTop - height - 3 * popupEdgeGap, bottom: anchorTop + anchorHeight + 2 * popupEdgeGap },
            );
        }
        if (placedAbove !== (preferredSide === "above") && (placedAbove || side === "bottom")) {
            // Flipped to the other side for lack of room: makes the most room it could take on the side the story asks for, the
            // whole popup next to the content's edge, so it flips back
            needed[preferredSide] = Math.max(needed[preferredSide], Math.ceil(height + 2 * popupEdgeGap));
        } else if (placedBeside) {
            // Placed beside its anchor, as a submenu is, or flipped there for lack of room above and below: makes the room it
            // would take on the side the story asks for, next to the anchor, which starts where the popup does
            if (preferredSide === "below") {
                needed.below = Math.max(needed.below, Math.ceil(anchorTop + anchorHeight + height + 3 * popupEdgeGap - contentBottom));
            } else {
                needed.above = Math.max(needed.above, Math.ceil(contentTop - (anchorTop - height - 3 * popupEdgeGap)));
            }
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
        const surfaceRect = surface.getBoundingClientRect();
        needed.reveal.set(surface, { top: surfaceRect.top - popupEdgeGap, bottom: surfaceRect.top + surface.offsetHeight + popupEdgeGap });
        if (overlay === surface) {
            // A surface placed on its own, e.g. a command palette at a fixed distance from the top
            needed.below = Math.max(needed.below, Math.ceil(surfaceRect.top + surface.offsetHeight + popupEdgeGap - contentBottom));
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
 * doesn't jump when the popup closes again. When a popup still lacks room because its trigger is next to the window's edge, e.g.
 * a select at the window's bottom, scrolls the page so that the popup opens in full.
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
        // The part of the page, by popup, that the page was scrolled to for it. Scrolls again only when the popup needs more of the
        // page, not when the reader scrolls it away, so the page doesn't fight the reader.
        const revealedRanges = new Map<HTMLElement, Range>();
        // Doesn't scroll the page for a popup that the story starts with open, e.g. further down the docs page while it loads
        let hasReaderInteracted = false;
        const onReaderInteraction = () => {
            hasReaderInteracted = true;
        };
        const measure = () => {
            frameRequest = undefined;
            const current = extraRoomRef.current;
            const { reveal, ...needed } = measureNeededRoom(room, current, side);
            // Measuring a surface changes its style for a moment, which isn't a change to measure again for
            observer.takeRecords();
            for (const popup of revealedRanges.keys()) {
                if (!reveal.has(popup)) {
                    revealedRanges.delete(popup);
                }
            }
            if (needed.above > current.above || needed.below > current.below) {
                setExtraRoom((previous) => ({ above: Math.max(previous.above, needed.above), below: Math.max(previous.below, needed.below) }));
                return;
            }
            if (!hasReaderInteracted) {
                return;
            }
            let range: Range | null = null;
            for (const [popup, popupRange] of reveal) {
                const pageRange = { top: popupRange.top + window.scrollY, bottom: popupRange.bottom + window.scrollY };
                const revealedRange = revealedRanges.get(popup);
                const needsMore = revealedRange === undefined || pageRange.top < revealedRange.top - 1 || pageRange.bottom > revealedRange.bottom + 1;
                if (needsMore && scrollToReveal(popupRange) !== 0) {
                    revealedRanges.set(popup, revealedRange === undefined ? pageRange : unite(revealedRange, pageRange));
                    range = unite(range, popupRange);
                }
            }
            const scrollBy = range === null ? 0 : scrollToReveal(range);
            if (Math.abs(scrollBy) >= 1) {
                document.scrollingElement?.scrollBy({ top: scrollBy, behavior: "instant" });
            }
        };
        const scheduleMeasure = () => {
            frameRequest ??= requestAnimationFrame(measure);
        };
        scheduleMeasure();
        const observer = new MutationObserver(scheduleMeasure);
        observer.observe(room, { subtree: true, childList: true, attributes: true, attributeFilter: ["style", "data-side", "data-open"] });
        room.addEventListener("animationend", scheduleMeasure);
        room.addEventListener("transitionend", scheduleMeasure);
        room.addEventListener("pointerdown", onReaderInteraction, { capture: true });
        room.addEventListener("keydown", onReaderInteraction, { capture: true });
        // A popup that the window kept from opening as in the app moves once the page scrolls
        window.addEventListener("scroll", scheduleMeasure, { capture: true, passive: true });
        return () => {
            observer.disconnect();
            room.removeEventListener("animationend", scheduleMeasure);
            room.removeEventListener("transitionend", scheduleMeasure);
            room.removeEventListener("pointerdown", onReaderInteraction, { capture: true });
            room.removeEventListener("keydown", onReaderInteraction, { capture: true });
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
        // Popups only re-measure their available room when an ancestor scrolls or the window resizes, not when the frame around
        // them grows. The frame may follow the room's size only a frame later, so this waits for the frame to change size, then
        // tells only the popups in the frame, as a scroll of the frame.
        let frameRequest: number | undefined;
        const observer = new ResizeObserver(() => {
            frameRequest ??= requestAnimationFrame(() => {
                frameRequest = undefined;
                frame.dispatchEvent(new Event("scroll"));
            });
        });
        observer.observe(frame);
        return () => {
            observer.disconnect();
            if (frameRequest !== undefined) {
                cancelAnimationFrame(frameRequest);
            }
        };
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

function ClosedOnFirstRender({ storyId, open, children }: { storyId: string; open: boolean; children: (closing: boolean) => ReactNode }) {
    const [closed, setClosed] = useState(!open);
    useEffect(() => {
        if (!closed) {
            updateStoryArgs(storyId, { open: false });
        }
        // Only the docs page's first render closes the overlay; the reader opens it again afterwards
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    if (!closed && !open) {
        setClosed(true);
    }
    return children(!closed);
}

/**
 * On docs pages, sets the `open` arg of a story with `parameters.closedOnDocsPage` to `false` when the page loads, so only its
 * trigger shows. A modal overlay that starts open would lock the docs page's scrolling and take the reader's focus as soon as the
 * page loads. The reader can still open the overlay with its trigger or the Controls panel, and the story's own page still starts
 * with the overlay open.
 */
export const closedOnDocsPageDecorator: Decorator = (Story, { id, args, parameters, viewMode }) => {
    if (viewMode !== "docs" || parameters.closedOnDocsPage !== true) {
        return <Story />;
    }
    return (
        <ClosedOnFirstRender storyId={id} open={args.open === true}>
            {(closing) => (closing ? <Story args={{ ...args, open: false }} /> : <Story />)}
        </ClosedOnFirstRender>
    );
};
