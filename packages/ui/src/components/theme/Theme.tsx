import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import type { ThemeBrand, ThemeColorScheme } from "../../theme/types";
import styles from "./Theme.module.scss";

export interface ThemeProps extends ComponentPropsWithoutRef<"div"> {
    /**
     * The active color scheme.
     *
     * @defaultValue "light"
     */
    colorScheme?: ThemeColorScheme | (string & {});
    /**
     * The brand that sets the color scales, corner radii, and fonts: `dextinity` for general applications, `ai-hub` for the AI Hub.
     * When unset, the subtree keeps the brand of the surrounding `Theme`, or Dextinity outside of one.
     */
    brand?: ThemeBrand;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * Gives the components in its subtree their styles, in the color scheme that `colorScheme` and the brand that `brand` sets. Wrap an
 * application, or a section of one.
 * For the tokens and how to customize them, see the "Tokens" pages in the Storybook.
 */
export const Theme = forwardRef<HTMLDivElement, ThemeProps>(function Theme({ colorScheme = "light", brand, className, children, ...restProps }, ref) {
    return (
        <div {...restProps} ref={ref} data-dextinity-color-scheme={colorScheme} data-dextinity-brand={brand} className={clsx(styles.root, className)}>
            {children}
        </div>
    );
});
