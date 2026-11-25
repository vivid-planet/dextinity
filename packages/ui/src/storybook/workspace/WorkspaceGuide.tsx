import { useState } from "react";

import { Icon } from "../../components/icon/Icon";
import { IconButton } from "../../components/iconButton/IconButton";
import { Popover } from "../../components/popover/Popover";
import styles from "./WorkspaceToolbarControls.module.scss";

const tools = [
    { icon: "file-data", name: "Content", description: "Empty, few, many, long texts, error, or loading, on all pages of the CMS prototype." },
    { icon: "align-justify", name: "Text length", description: "All texts 40 % longer or twice as long, as translations often are." },
    { icon: "magic-wand", name: "Tokens", description: "Accent and neutral hues, text size, corner radii, and title weight, live; copied as CSS." },
    {
        icon: "window",
        name: "Compare",
        description: "Phone, tablet, and desktop side by side, two variants side by side, or swiped on top of each other.",
    },
    { icon: "select", name: "Pick", description: "Click a component in the page to open its story." },
    {
        icon: "crop-action",
        name: "Measure",
        description: "Size, spacing, font, and colors of an element with their tokens; point at another for the distance.",
    },
    { icon: "chat-add", name: "Comments", description: "Pin a comment to an element; the list copies all comments of the prototype." },
    { icon: "pencil-line", name: "Edit texts", description: "Click a text to change it in place; kept across reloads and copied as a list." },
    { icon: "link-diagonal", name: "Hotspots", description: "Make an element open another page, also one you added." },
    {
        icon: "contrast",
        name: "Accessibility",
        description: "Tab order, controls smaller than 24 × 24 pixels, and low contrast in the visible area.",
    },
    { icon: "tune-logic", name: "Flow map", description: "All pages and the links between them; shows pages without a way on." },
    { icon: "eye", name: "Present", description: "Only the prototype, for walking someone through it; Escape ends it." },
] as const;

/** What the workspace's tools do, for finding the right one without trying each icon. */
export function WorkspaceGuide() {
    const [open, setOpen] = useState(false);
    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            title="Tools for prototyping"
            placement="bottom-end"
            trigger={
                <IconButton variant="text" color="secondary" aria-label="What the tools do">
                    <Icon name="help-circle" />
                </IconButton>
            }
        >
            <ul className={styles.guide}>
                {tools.map((tool) => (
                    <li key={tool.name}>
                        <Icon name={tool.icon} />
                        <span>
                            <strong>{tool.name}</strong> {tool.description}
                        </span>
                    </li>
                ))}
            </ul>
            <p className={styles.guideNote}>New pages, comments, text changes, hotspots, and tokens are kept in this browser only.</p>
        </Popover>
    );
}
