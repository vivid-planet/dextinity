import type { Decorator, Parameters } from "@storybook/react-vite";

import styles from "./docsPopups.module.scss";

/**
 * Where a story's popup opens, relative to its trigger. Set as `parameters.popupRoom` on a story whose popup — a select's options,
 * a menu, a calendar — would otherwise be cut off by the story's frame on the docs page.
 */
export type PopupRoom = "below" | "above";

/**
 * On docs pages, gives a story with `parameters.popupRoom` a minimum height, with the story at the top for popups that open below
 * their trigger, or at the bottom for popups that open above. The story's own page stays as it is.
 */
export const popupRoomDecorator: Decorator = (Story, { parameters, viewMode }) => {
    const popupRoom: unknown = parameters.popupRoom;
    if (viewMode !== "docs" || (popupRoom !== "below" && popupRoom !== "above")) {
        return <Story />;
    }
    return (
        <div className={popupRoom === "above" ? `${styles.popupRoom} ${styles.popupRoomAbove}` : styles.popupRoom}>
            <div>
                <Story />
            </div>
        </div>
    );
};

/**
 * The `docs` parameters for stories that open a modal overlay, such as a dialog or a drawer. The docs page renders each story in its
 * own frame of the given height, so the overlay's scroll lock and focus trap stay in that frame and don't take over the docs page.
 */
export function modalOverlayDocs(height: string): Parameters["docs"] {
    return { story: { inline: false, height } };
}
