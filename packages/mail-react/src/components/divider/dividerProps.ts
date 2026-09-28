import type { CSSProperties } from "react";

import type { DividerVariantName } from "../../theme/themeTypes.js";

export interface DividerProps {
    /**
     * The component's variant to apply, as defined in the theme. Requires a
     * theme (`ThemeProvider` or `MjmlMailRoot`) when set.
     *
     * Custom variants should be defined in the theme through module augmentation:
     *
     * ```ts
     * declare module "@dextinity/mail-react" {
     *     interface DividerVariants { thin: true; thick: true }
     * }
     * ```
     *
     * ```ts
     * const theme = createTheme({
     *     divider: {
     *         variants: {
     *             thin: { height: 1 },
     *             thick: { height: 8 },
     *         },
     *     },
     * });
     * ```
     *
     * @defaultValue The theme's `divider.defaultVariant`, when set
     */
    variant?: DividerVariantName;
    /**
     * Height of the divider in pixels.
     *
     * @defaultValue The theme's `divider` height for the active variant
     */
    height?: number;
    /**
     * Background color of the divider (e.g. `"#FF0000"`).
     *
     * @defaultValue The theme's `divider` background color for the active variant
     */
    backgroundColor?: string;
    /**
     * Background image for the divider — typically a gradient. Clients that
     * don't render `background-image` fall back to the solid `backgroundColor`.
     *
     * @defaultValue The theme's `divider` background image for the active variant
     */
    backgroundImage?: string;
    className?: string;
    style?: CSSProperties;
}
