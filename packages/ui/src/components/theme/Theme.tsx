import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";

import type { ThemeColorScheme } from "../../theme/types";
import styles from "./Theme.module.scss";

/** @experimental */
export interface ThemeProps extends ComponentPropsWithoutRef<"div"> {
    /**
     * The active color scheme.
     *
     * @defaultValue "light"
     */
    colorScheme?: ThemeColorScheme | (string & {});
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * Scopes the active color scheme to its subtree. Wrap an application, or a section of one.
 *
 * @experimental
 */
export function Theme({ colorScheme = "light", className, children, ...restProps }: ThemeProps) {
    return (
        <div {...restProps} data-dextinity-color-scheme={colorScheme} className={clsx(styles.root, className)}>
            {children}
        </div>
    );
}
