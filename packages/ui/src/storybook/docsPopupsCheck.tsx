import type { Decorator, StoryContext } from "@storybook/react-vite";
import { userEvent } from "storybook/test";

import { DocsPopupRoom, findClippingFrame, findOpenPopups, overlaySurfaceHeight, parsePopupRoom, shrunkAnchoredPopupHeight } from "./docsPopups";
import styles from "./docsPopupsCheck.module.scss";

let isEnabled = false;

/**
 * Turns on the docs popup check for the story tests of this run: every story renders in a frame like the one of a docs page, and
 * after its play function, the check opens the story's popups and fails when the frame cuts one off or shrinks it.
 */
export function enableDocsPopupCheck() {
    isEnabled = true;
}

/**
 * While the check is on, renders the story in a {@link DocsPopupRoom} in a frame like the one of a docs page: as wide, scrolling
 * what overflows it, and the containing block of fixed overlays, e.g. a dialog.
 */
export const docsFrameDecorator: Decorator = (Story, { id, parameters }) => {
    if (!isEnabled) {
        return <Story />;
    }
    const popupRoom = parameters.popupRoom === undefined ? undefined : parsePopupRoom(parameters.popupRoom, id);
    return (
        <div className={styles.page}>
            <div className={styles.frame} data-docs-frame="">
                <div className={styles.zoom}>
                    <DocsPopupRoom side={popupRoom?.side}>
                        <Story />
                    </DocsPopupRoom>
                </div>
            </div>
        </div>
    );
};

const triggerSelector = ["[aria-haspopup]:not([aria-haspopup='false'])", "[role='combobox']"]
    .map((selector) => `${selector}:not(:disabled)`)
    .join(", ");

// Opens at most this many popups per story, as the first ones are those the story is about
const maxTriggersPerStory = 6;

function nextFrame() {
    return new Promise((resolve) => requestAnimationFrame(resolve));
}

// Waits until the room has stopped growing and the page has stopped scrolling for a few frames: the room measures the popups a
// frame after they move, and they move again once the frame has grown or the room has scrolled the page
async function waitForRoomToSettle(room: HTMLElement) {
    let previousSize = "";
    let stableFrames = 0;
    for (let frame = 0; frame < 120 && stableFrames < 5; frame++) {
        await nextFrame();
        const size = `${room.style.paddingBlockStart}/${room.style.paddingBlockEnd}/${room.offsetHeight}/${window.scrollY}`;
        stableFrames = size === previousSize ? stableFrames + 1 : 0;
        previousSize = size;
    }
}

function describePopup(popup: HTMLElement) {
    const surface = popup.querySelector<HTMLElement>("[role]") ?? popup;
    const name = surface.getAttribute("aria-label") ?? "";
    return `${surface.getAttribute("role") ?? popup.tagName.toLowerCase()}${name ? ` "${name}"` : ""}`;
}

function findPopupProblems(room: HTMLElement, frame: HTMLElement) {
    const problems: string[] = [];
    const { anchored, overlays } = findOpenPopups(room);
    const popups = [
        ...anchored.map((popup) => ({ popup, clip: frame, shrunkHeight: shrunkAnchoredPopupHeight(popup) })),
        ...overlays.flatMap(({ surface, overlay }) => [
            { popup: surface, clip: frame, shrunkHeight: overlaySurfaceHeight(surface, overlay) - surface.offsetHeight },
            // A dialog's overlay scrolls the dialog when it doesn't fit
            ...(overlay === surface ? [] : [{ popup: surface, clip: overlay, shrunkHeight: 0 }]),
        ]),
    ];
    for (const { popup, clip, shrunkHeight } of popups) {
        const rect = popup.getBoundingClientRect();
        const clipRect = clip.getBoundingClientRect();
        if (rect.top < clipRect.top - 1 || rect.bottom > clipRect.bottom + 1) {
            problems.push(
                `${describePopup(popup)} is cut off by the ${clip === frame ? "frame" : "overlay"} (${Math.round(clipRect.top - rect.top)}px above, ${Math.round(rect.bottom - clipRect.bottom)}px below)`,
            );
        }
        if (shrunkHeight > 1) {
            problems.push(`${describePopup(popup)} is shrunk by the frame and scrolls ${shrunkHeight}px`);
        }
    }
    return problems;
}

async function closePopups() {
    await userEvent.keyboard("{Escape}");
    await userEvent.keyboard("{Escape}");
}

// Where a reader may find a trigger when they click it: near the window's top edge, with the story's top in view when it fits
// the window, and next to the window's bottom edge, where its popup has no room below in the window
const triggerPlacements = {
    "near the window's top": (trigger: HTMLElement, frame: HTMLElement) => {
        if (frame.offsetHeight <= window.innerHeight) {
            frame.scrollIntoView({ block: "start" });
        } else {
            trigger.scrollIntoView({ block: "start" });
        }
    },
    "at the window's bottom": (trigger: HTMLElement) => trigger.scrollIntoView({ block: "end" }),
};

/**
 * After a story's play function, checks while {@link enableDocsPopupCheck} is on that no popup open in the story, and no popup
 * that one of its triggers opens, is cut off or shrunk by the story's frame on the docs page. Clicks each trigger twice, once
 * near the window's top and once at its bottom.
 */
export async function checkDocsPopups({ canvasElement, id }: StoryContext) {
    const room = isEnabled ? canvasElement.querySelector<HTMLElement>("[data-docs-popup-room]") : null;
    const frame = room === null ? null : findClippingFrame(room);
    const page = frame?.parentElement;
    if (room === null || frame === null || !page) {
        return;
    }
    page.dataset.checking = "";
    frame.scrollIntoView({ block: "start" });
    await waitForRoomToSettle(room);
    const problems = findPopupProblems(room, frame).map((problem) => `${problem}, after the play function`);

    const popupSelector = "[data-side], [role='dialog'], [role='alertdialog']";
    const triggers = [...room.querySelectorAll<HTMLElement>(triggerSelector)]
        .filter((trigger) => trigger.closest(popupSelector) === null && trigger.getClientRects().length > 0)
        .slice(0, maxTriggersPerStory);
    for (const trigger of triggers) {
        for (const [placement, placeTrigger] of Object.entries(triggerPlacements)) {
            if (!trigger.isConnected || trigger.closest("[inert], [aria-hidden='true']") !== null) {
                continue;
            }
            await closePopups();
            await waitForRoomToSettle(room);
            placeTrigger(trigger, frame);
            await userEvent.click(trigger, { pointerEventsCheck: 0 });
            await waitForRoomToSettle(room);
            const name = (trigger.getAttribute("aria-label") ?? trigger.textContent?.trim() ?? "").slice(0, 40);
            problems.push(...findPopupProblems(room, frame).map((problem) => `${problem}, opened by "${name}" ${placement}`));
        }
    }
    await closePopups();

    if (problems.length > 0) {
        throw new Error(`On the docs page of "${id}", popups don't fit the story's frame:\n- ${[...new Set(problems)].join("\n- ")}`);
    }
}
