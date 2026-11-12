import type { Decorator, Parameters } from "@storybook/react-vite";

import styles from "./docsPopups.module.scss";

type PopupSide = "below" | "above";

/**
 * Where a story's popup opens relative to its trigger, and the story's minimum height on the docs page that fits the open popup,
 * 300px by default. Set as `parameters.popupRoom` on a story whose popup — a select's options, a menu, a calendar — would otherwise
 * be cut off by the story's frame on the docs page.
 */
export interface PopupRoom {
    side: PopupSide;
    minHeight?: string;
}

// Storybook's `Parameters` type accepts anything, so a mistyped value would otherwise leave the popup cut off without a hint why
function parsePopupRoom(popupRoom: unknown, storyId: string): PopupRoom {
    if (typeof popupRoom === "object" && popupRoom !== null) {
        const { side, minHeight, ...rest } = popupRoom as Record<string, unknown>;
        if ((side === "below" || side === "above") && (minHeight === undefined || typeof minHeight === "string") && Object.keys(rest).length === 0) {
            return { side, minHeight };
        }
    }
    throw new Error(
        `Story "${storyId}" sets \`parameters.popupRoom\` to ${JSON.stringify(popupRoom)}; expected { side: "below" | "above", minHeight?: string }.`,
    );
}

/**
 * On docs pages, gives a story with `parameters.popupRoom` a minimum height, with the story at the top for popups that open below
 * their trigger, or at the bottom for popups that open above. The story's own page stays as it is.
 */
export const popupRoomDecorator: Decorator = (Story, { id, parameters, viewMode }) => {
    if (parameters.popupRoom === undefined) {
        return <Story />;
    }
    const { side, minHeight } = parsePopupRoom(parameters.popupRoom, id);
    if (viewMode !== "docs") {
        return <Story />;
    }
    return (
        <div
            className={side === "above" ? `${styles.popupRoom} ${styles.popupRoomAbove}` : styles.popupRoom}
            style={minHeight === undefined ? undefined : { minBlockSize: minHeight }}
        >
            <div>
                <Story />
            </div>
        </div>
    );
};

/**
 * The `docs` parameters for a story that starts with a modal overlay open, such as a dialog or a drawer. The docs page renders the
 * story in its own frame of the given height, so the overlay's scroll lock and focus trap stay in that frame and don't take over the
 * docs page. The frame runs the story's play function as soon as it loads, which would move the reader's focus, so such a story has
 * no play function: its interaction test goes in a dev story.
 */
export function modalOverlayDocs(height: string): Parameters["docs"] {
    return { story: { inline: false, height } };
}

/**
 * In a story's own frame on a docs page (see `modalOverlayDocs`), ignores calls to `focus()` until the reader moves into that frame.
 * An overlay that starts open moves the focus into itself, and in a frame, that takes the focus away from the docs page as soon as
 * the frame loads.
 */
export function preventFocusInDocsFramesUntilUsed() {
    if (!window.frameElement?.id.startsWith("iframe--")) {
        return;
    }
    // Not `navigator.userActivation`: a click anywhere on the docs page activates its same-origin frames too
    let used = false;
    const markUsed = () => {
        used = true;
    };
    for (const type of ["focus", "pointerdown", "keydown"]) {
        window.addEventListener(type, markUsed, { capture: true, once: true });
    }
    const focus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function (options) {
        if (used) {
            focus.call(this, options);
        }
    };
}
