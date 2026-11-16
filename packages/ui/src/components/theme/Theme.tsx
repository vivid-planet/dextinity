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
 * Gives the components in its subtree their styles, in the color scheme that `colorScheme` sets. Wrap an application, or a section of one.
 * For the tokens and how to customize them, see the "Theme" pages in the Storybook.
 */
export const Theme = forwardRef<HTMLDivElement, ThemeProps>(function Theme({ colorScheme = "light", className, children, ...restProps }, ref) {
    return (
        <div {...restProps} ref={ref} data-dextinity-color-scheme={colorScheme} className={clsx(styles.root, className)}>
            {children}
        </div>
    );
});
