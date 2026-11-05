import type { CSSProperties } from "react";

import { useResolvedTokens } from "../ThemedProbe";
import { DocsDemo } from "./DocsDemo";
import styles from "./Foundations.module.scss";

const spaces = [
    { token: "--dextinity-space-1", usage: "Icon to text, tight" },
    { token: "--dextinity-space-2", usage: "Inside controls" },
    { token: "--dextinity-space-3", usage: "Fields in dense areas" },
    { token: "--dextinity-space-4", usage: "Panel padding" },
    { token: "--dextinity-space-panel-gap", usage: "Between glass panels" },
    { token: "--dextinity-space-6", usage: "Between sections" },
    { token: "--dextinity-space-8", usage: "Page margin" },
    { token: "--dextinity-space-12", usage: "Large sections" },
];

/**
 * The spacing scale with live values, drawn to scale.
 */
export function SpacingScale() {
    const { values, probe } = useResolvedTokens(spaces.map(({ token }) => token));

    return (
        <DocsDemo>
            {probe}
            <div className={styles.spacingScale}>
                {spaces.map(({ token, usage }) => (
                    <div key={token} className={styles.spacingRow}>
                        <span className={styles.mono}>{parseFloat(values[token] ?? "") || ""}</span>
                        <i style={{ "--space": `var(${token})` } as CSSProperties} />
                        <span>{usage}</span>
                        <code className={styles.spacingToken}>{token}</code>
                    </div>
                ))}
            </div>
        </DocsDemo>
    );
}
