import { composeStories } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";

import * as overviewStories from "../../../components/overviewLayout/__stories__/OverviewLayout.stories";
import { SegmentedControl } from "../../../components/segmentedControl/SegmentedControl";
import styles from "./WidgetGlassExploration.module.scss";

const { Default: Overview } = composeStories(overviewStories);

type GlassLevel = "glass" | "glass-strong" | "glass-overlay";

const levels: Array<{ value: GlassLevel; label: string }> = [
    { value: "glass", label: "Glass" },
    { value: "glass-strong", label: "Strong" },
    { value: "glass-overlay", label: "Overlay" },
];

/**
 * The overview with the cards on a switchable glass material, from the current, most see-through one to the overlays' almost
 * opaque one.
 */
export function WidgetGlassExploration() {
    const [level, setLevel] = useState<GlassLevel>("glass-strong");

    return (
        <div style={{ "--dextinity-card-background": `var(--dextinity-material-${level})` } as CSSProperties}>
            <Overview />
            <div className={styles.switcher}>
                <span className={styles.switcherLabel}>Card glass</span>
                <SegmentedControl size="small" aria-label="Card glass" options={levels} value={level} onChange={setLevel} />
            </div>
        </div>
    );
}
