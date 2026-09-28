import type { AnchorHTMLAttributes } from "react";

import type { ButtonVariantName } from "../../theme/themeTypes.js";

export interface ButtonProps {
    /**
     * The component's variant to apply, as defined in the theme.
     *
     * Custom variants should be defined in the theme through module augmentation:
     *
     * ```ts
     * declare module "@dextinity/mail-react" {
     *     interface ButtonVariants { primary: true; secondary: true }
     * }
     * ```
     *
     * ```ts
     * const theme = createTheme({
     *     button: {
     *         variants: {
     *             primary: { backgroundColor: "#5B4FC7", color: "#FFFFFF" },
     *             secondary: { backgroundColor: "#EEEEEE", color: "#222222" },
     *         },
     *     },
     * });
     * ```
     *
     * @defaultValue The theme's `button.defaultVariant`, when set
     */
    variant?: ButtonVariantName;
    /** When true, the button spans the full width of its container. */
    fullWidth?: boolean;
    /** @defaultValue "#" */
    href?: string;
    /** @defaultValue "_blank" */
    target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
}
