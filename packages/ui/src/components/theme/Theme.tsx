import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import type { ThemeColorScheme } from "../../theme/types";
import styles from "./Theme.module.scss";

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
 */
export const Theme = forwardRef<HTMLDivElement, ThemeProps>(function Theme({ colorScheme = "light", className, children, ...restProps }, ref) {
    return (
        <div {...restProps} ref={ref} data-dextinity-color-scheme={colorScheme} className={clsx(styles.root, className)}>
            {children}
        </div>
    );
});
