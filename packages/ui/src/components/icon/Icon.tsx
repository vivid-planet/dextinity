import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, type CSSProperties, forwardRef } from "react";

import styles from "./Icon.module.scss";
import type { IconName } from "./iconRegistry";

export interface IconProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
    /** The name of the icon, one of the keys of `IconRegistry`. */
    name: IconName;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Names the icon for assistive technology. Without it or `aria-labelledby`, the icon is hidden from assistive technology. */
    "aria-label"?: string;
}

/**
 * Shows an icon of the icon set in the current text color, or in its own colors when it is a colored icon. It is 16×16 pixels.
 *
 * To use the default icons of `@dextinity/ui`, import `@dextinity/ui/css/icons` once in your application, see [Installation and setup](?path=/docs/intro--docs#installation-and-setup).
 *
 * For a list of all icons, see [All icons](?path=/docs/theme-all-icons--docs). To replace or add icons, see [Customize icon set](?path=/docs/theme-customize-icon-set--docs).
 */
export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon(
    { name, className, style, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...restProps },
    ref,
) {
    const isLabeled = ariaLabel !== undefined || ariaLabelledBy !== undefined;
    const iconStyle: CSSProperties & Record<`--${string}`, string> = {
        "--dextinity-current-icon-mask": `var(--dextinity-icon-${name})`,
        "--dextinity-current-icon-image": `var(--dextinity-colored-icon-${name})`,
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
            className={clsx(styles.root, className)}
            style={iconStyle}
        />
    );
});
