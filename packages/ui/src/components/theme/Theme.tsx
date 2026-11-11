import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import type { ThemeBrand, ThemeColorScheme, ThemeDensity } from "../../theme/types";
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
    /**
     * The size of controls, rows, and the space between fields: `comfortable`, `standard`, or `compact`. Text keeps its size. On touch
     * screens, `compact` stays at the size of `standard`. When unset, the subtree keeps the density of the surrounding `Theme`, or
     * `standard` outside of one.
     */
    density?: ThemeDensity;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * Gives the components in its subtree their styles, in the color scheme that `colorScheme` and the brand and density that `brand` and `density` set. Wrap an
 * application, or a section of one.
 * For the tokens and how to customize them, see the "Tokens" pages in the Storybook.
 */
export const Theme = forwardRef<HTMLDivElement, ThemeProps>(function Theme(
    { colorScheme = "light", brand, density, className, children, ...restProps },
    ref,
) {
    return (
        <div
            {...restProps}
            ref={ref}
            data-dextinity-color-scheme={colorScheme}
            data-dextinity-brand={brand}
            data-dextinity-density={density}
            className={clsx(styles.root, className)}
        >
            {children}
        </div>
    );
});
