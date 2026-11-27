import { useState } from "react";

import { Icon } from "../../components/icon/Icon";
import { IconButton } from "../../components/iconButton/IconButton";
import { Popover } from "../../components/popover/Popover";
import styles from "./WorkspaceToolbarControls.module.scss";

const modes = [
    { key: "1", name: "Prototype", description: "Click through and show it, with as much room as possible. Double click an element to inspect it." },
    {
        key: "2",
        name: "Inspect",
        description:
            "Component opens a component's story, Measure shows spacing and tokens, Accessibility checks tab order, targets, and contrast, Compare shows devices or variants side by side.",
    },
    {
        key: "3",
        name: "Review",
        description: "Pin comments to the page and edit texts in place; comments copy as a list, text changes as a list or as a request for code.",
    },
    {
        key: "4",
        name: "Flow",
        description: "The flow map of all pages and their links; Link elements makes an element open another page. New pages come from the panel.",
    },
    { key: "", name: "Library", description: "Storybook with all components and their stories." },
] as const;

/** What the workspace's modes are for, for finding the right one without trying each. */
export function WorkspaceGuide() {
    const [open, setOpen] = useState(false);
    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            title="Modes"
            placement="bottom-end"
            trigger={
                <IconButton variant="text" color="secondary" aria-label="What the modes do">
                    <Icon name="help-circle" />
                </IconButton>
            }
        >
            <ul className={styles.guide}>
                {modes.map((mode) => (
                    <li key={mode.name}>
                        <kbd className={styles.guideKey}>{mode.key}</kbd>
                        <span>
                            <strong>{mode.name}</strong> {mode.description}
                        </span>
                    </li>
                ))}
            </ul>
            <p className={styles.guideNote}>
                Keys open a tool in its mode and close it again: I Component, M Measure, A Accessibility, C Comments, E Edit texts, F Flow map, L Link
                elements. Escape closes the open tool.
            </p>
            <p className={styles.guideNote}>
                Component highlights the innermost component under the pointer; ↑ or [ moves to the component around it, ↓ or ] back in, and a click
                opens the highlighted one.
            </p>
            <p className={styles.guideNote}>
                View sets the content, text length, color scheme, theme, density, and tokens, and keeps combinations as presets.
            </p>
            <p className={styles.guideNote}>New pages, comments, text changes, hotspots, and tokens are kept in this browser only.</p>
        </Popover>
    );
}
