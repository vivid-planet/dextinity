import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, type CSSProperties, forwardRef } from "react";

import styles from "./Icon.module.scss";
import type { IconName } from "./iconRegistry";

type IconSize = "small" | "default" | "large";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type IconOwnerState = {
    size: IconSize | undefined;
    duotone: boolean;
};

export interface IconProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
    /** The name of the icon, one of the keys of `IconRegistry`. */
    name: IconName;
    /**
     * `small` (16px) in buttons, fields, and tables, `default` (20px) in navigation, `large` (24px) in empty states and card headers.
     * Without a size, the icon follows the surrounding component's `--dextinity-icon-size`, and is 16px outside of one.
     */
    size?: IconSize;
    /**
     * Adds a soft fill behind the line, for card headers and empty states. The fill is the CSS variable `--dextinity-duotone-icon-<name>`;
     * an icon without one shows only its line. Off in high contrast.
     *
     * @defaultValue `false`
     */
    duotone?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Names the icon for assistive technology. Without it or `aria-labelledby`, the icon is hidden from assistive technology. */
    "aria-label"?: string;
}

/**
 * Shows an icon of the icon set in the current text color, or in its own colors when it is a colored icon.
 *
 * To use the default icons of `@dextinity/ui`, import `@dextinity/ui/css/icons` once in your application, see [Installation and setup](?path=/docs/intro--docs#installation-and-setup).
 *
 * For a list of all icons, see [All icons](?path=/docs/foundations-icons-all-icons--docs). To replace or add icons, see [Customize icon set](?path=/docs/foundations-icons-customize-icon-set--docs).
 */
export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon(
    { name, size, duotone = false, className, style, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...restProps },
    ref,
) {
    const ownerState: IconOwnerState = { size, duotone };
    const isLabeled = ariaLabel !== undefined || ariaLabelledBy !== undefined;
    const iconStyle: CSSProperties & Record<`--${string}`, string> = {
        "--dextinity-current-icon-mask": `var(--dextinity-icon-${name})`,
        "--dextinity-current-icon-image": `var(--dextinity-colored-icon-${name})`,
        ...(ownerState.duotone && { "--dextinity-current-duotone-icon-mask": `var(--dextinity-duotone-icon-${name})` }),
        ...style,
    };

    return (
        <span
            ref={ref}
            aria-hidden={isLabeled ? undefined : true}
            role={isLabeled ? "img" : undefined}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            {...restProps}
            data-size={ownerState.size}
            data-duotone={ownerState.duotone ? "" : undefined}
            className={clsx(styles.root, className)}
            style={iconStyle}
        />
    );
});
