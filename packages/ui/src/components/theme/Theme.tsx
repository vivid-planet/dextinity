import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import type { ThemeBrand, ThemeColorScheme, ThemeDensity } from "../../theme/types";
import styles from "./Theme.module.scss";

export interface ThemeProps extends ComponentPropsWithoutRef<"div"> {
    /**
     * The active color scheme.
     *
     * @defaultValue `"light"`
     */
    colorScheme?: ThemeColorScheme | (string & {});
    /**
     * The brand: hues, fonts, shape, and icons. Built in are `dextinity`, `ai-hub`, and `cms`; a custom brand is a CSS block on
     * `[data-dextinity-brand="<name>"]` that sets the `--dextinity-brand-*` tokens and, optionally, `--dextinity-icon-*` overrides.
     *
     * @defaultValue `"dextinity"`
     */
    brand?: ThemeBrand | (string & {});
    /**
     * Fixed control heights, row heights, and spacing. The font size stays the same.
     *
     * @defaultValue `"standard"`
     */
    density?: ThemeDensity;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * Scopes the color scheme, brand, and density to its subtree. Wrap an application, or a section of one.
 */
export const Theme = forwardRef<HTMLDivElement, ThemeProps>(function Theme(
    { colorScheme = "light", brand = "dextinity", density = "standard", className, children, ...restProps },
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
