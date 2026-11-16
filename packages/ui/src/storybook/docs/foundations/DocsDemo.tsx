import { clsx } from "clsx";
import type { PropsWithChildren } from "react";

import { ToolbarThemed } from "../ThemedProbe";
import styles from "./Foundations.module.scss";

export interface DocsDemoProps {
    /** Lays the demo over the light field, the backdrop glass is made for. */
    lightField?: boolean;
}

/**
 * A demo block on a docs page, rendered in the brand, color scheme, and density picked in the toolbar.
 */
export function DocsDemo({ lightField = false, children }: PropsWithChildren<DocsDemoProps>) {
    return (
        <ToolbarThemed>
            <div className={clsx("sb-unstyled", styles.demo, lightField && styles.lightField)}>{children}</div>
        </ToolbarThemed>
    );
}
