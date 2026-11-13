import type { Decorator } from "@storybook/react-vite";

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
