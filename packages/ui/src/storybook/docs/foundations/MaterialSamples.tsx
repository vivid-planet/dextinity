import type { CSSProperties } from "react";

import { DocsDemo } from "./DocsDemo";
import styles from "./Foundations.module.scss";

const shadows = [
    { token: "--dextinity-shadow-1", usage: "Buttons, rows" },
    { token: "--dextinity-shadow-2", usage: "Cards, panels" },
    { token: "--dextinity-shadow-3", usage: "Menus, dialogs" },
];

/**
 * The shadow levels and the two glass materials over the light field.
 */
export function MaterialSamples() {
    return (
        <DocsDemo>
            <div className={styles.specGrid}>
                {shadows.map(({ token, usage }) => (
                    <div key={token} className={styles.spec}>
                        <div className={styles.specSample}>
                            <i className={styles.shadowSample} style={{ "--shadow": `var(${token})` } as CSSProperties} />
                        </div>
                        <b>{token.replace("--dextinity-", "")}</b>
                        <span>{usage}</span>
                        <code>{token}</code>
                    </div>
                ))}
                <div className={styles.spec}>
                    <div className={styles.specSample}>
                        <div className={styles.glassSample}>
                            <div data-material="glass">glass</div>
                            <div data-material="glass-strong">glass-strong</div>
                        </div>
                    </div>
                    <b>Glass</b>
                    <span>Panel over the light field</span>
                    <code>--dextinity-material-glass</code>
                    <code>--dextinity-material-glass-strong</code>
                </div>
            </div>
        </DocsDemo>
    );
}
