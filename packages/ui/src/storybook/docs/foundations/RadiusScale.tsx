import type { CSSProperties } from "react";

import { useResolvedTokens } from "../ThemedProbe";
import { DocsDemo } from "./DocsDemo";
import styles from "./Foundations.module.scss";
import { useComputedTokens } from "./useComputedTokens";

const radii = [
    { token: "--dextinity-radius-item", name: "8 × r", usage: "Menu items, tags" },
    { token: "--dextinity-radius-control", name: "Control", usage: "Controls (set by the brand)" },
    { token: "--dextinity-radius-field", name: "14 × r", usage: "Inputs on glass, blocks" },
    { token: "--dextinity-radius-row", name: "20 × r", usage: "Rows, menus" },
    { token: "--dextinity-radius-panel", name: "30 × r", usage: "Panels" },
    { token: "--dextinity-radius-pill", name: "Pill", usage: "Pills, switches" },
];

/**
 * The radii with their live values, scaled by the brand's radius factor `r`.
 */
export function RadiusScale() {
    const { values: factor, probe: factorProbe } = useResolvedTokens(["--dextinity-brand-radius-factor"]);
    const { values, probe } = useComputedTokens(
        radii.map(({ token }) => token),
        "borderTopLeftRadius",
    );

    return (
        <DocsDemo>
            {factorProbe}
            {probe}
            <div className={styles.specGrid}>
                {radii.map(({ token, name, usage }) => (
                    <div key={token} className={styles.spec}>
                        <div className={styles.specSample}>
                            <i className={styles.radiusSample} style={{ "--radius": `var(${token})` } as CSSProperties} />
                        </div>
                        <b>{name}</b>
                        <span>{usage}</span>
                        <code>{token}</code>
                        <code>{values[token]}</code>
                    </div>
                ))}
            </div>
            <p className={styles.note}>
                r = <code>{factor["--dextinity-brand-radius-factor"]}</code> in the current brand
            </p>
        </DocsDemo>
    );
}
