import type { CSSProperties } from "react";

import { ToolbarTheme } from "../themeDecorator";
import styles from "./Samples.module.scss";

export interface SamplesProps {
    /** One box per sample, styled with the given CSS, such as `{ borderRadius: "var(--dextinity-brand-radius-card)" }`. */
    samples: Array<{ label: string; style: CSSProperties; variant?: "plain" | "glass" }>;
}

/**
 * Shows tokens that can't be read as a value, such as corner radii, shadows, and glass, as boxes in the toolbar's theme.
 */
export function Samples({ samples }: SamplesProps) {
    return (
        <ToolbarTheme>
            <div className={styles.root}>
                {samples.map(({ label, style, variant = "plain" }) => (
                    <figure key={label} className={styles.sample}>
                        <div className={variant === "glass" ? styles.glassBox : styles.box} style={style} />
                        <figcaption className={styles.label}>{label}</figcaption>
                    </figure>
                ))}
            </div>
        </ToolbarTheme>
    );
}
