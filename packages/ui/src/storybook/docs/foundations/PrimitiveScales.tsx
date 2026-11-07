import type { CSSProperties } from "react";

import { DocsDemo } from "./DocsDemo";
import styles from "./Foundations.module.scss";

const scales = ["primary", "secondary", "neutral", "success", "warning", "danger", "info"];
const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

/**
 * The 11-stop primitive color scales, computed from the brand's hues and chromas.
 */
export function PrimitiveScales() {
    return (
        <DocsDemo>
            <div className={styles.scales}>
                <span />
                {steps.map((step) => (
                    <span key={step} className={styles.scaleStep}>
                        {step}
                    </span>
                ))}
                {scales.map((scale) => (
                    <div key={scale} className={styles.scaleRow}>
                        <code>{scale}</code>
                        {steps.map((step) => (
                            <i
                                key={step}
                                title={`--dextinity-color-${scale}-${step}`}
                                style={{ "--scale-color": `var(--dextinity-color-${scale}-${step})` } as CSSProperties}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </DocsDemo>
    );
}
