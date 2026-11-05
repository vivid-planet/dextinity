import { clsx } from "clsx";
import { type CSSProperties, forwardRef, type HTMLAttributes } from "react";

import styles from "./Icon.module.scss";
import type { IconName } from "./iconNames";

type IconSize = "small" | "default" | "large";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type IconOwnerState = {
    name: string;
    size: IconSize | undefined;
    duotone: boolean;
};

export interface IconProps extends Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children"> {
    /**
     * Name from the icon set, e.g. `globe`, `sparkle`, `folder`. The glyph is read from the CSS variable `--dextinity-icon-<name>`,
     * so a brand or theme can replace any icon — or add a new one — in CSS alone.
     */
    name: IconName | (string & {});
    /**
     * `small` (16px) in buttons, fields, and tables, `default` (20px) in navigation and icon buttons, `large` (24px) in empty states and card
     * headers. Without a size, the icon follows the surrounding component's `--dextinity-icon-size`.
     */
    size?: IconSize;
    /** Makes the icon accessible as an image with this name. Without a label, the icon is decorative and hidden from assistive technology. */
    label?: string;
    /** Adds a soft fill behind the line, for card headers and empty states. Off in high contrast. */
    duotone?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
}

function toCssIdentifier(name: string) {
    return name.replace(/[^a-z0-9-]/gi, "");
}

/**
 * An icon from the set. It inherits the text color.
 */
export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon(
    { name, size, label, duotone = false, className, style, ...restProps },
    ref,
) {
    const ownerState: IconOwnerState = { name, size, duotone };
    const identifier = toCssIdentifier(ownerState.name);

    return (
        <span
            role={label != null ? "img" : undefined}
            aria-label={label}
            aria-hidden={label != null ? undefined : true}
            {...restProps}
            ref={ref}
            data-name={identifier}
            data-size={ownerState.size}
            data-duotone={ownerState.duotone ? "" : undefined}
            className={clsx(styles.root, className)}
            style={
                {
                    "--dextinity-icon-glyph": `var(--dextinity-icon-${identifier})`,
                    "--dextinity-icon-glyph-duotone": `var(--dextinity-icon-${identifier}-duotone, linear-gradient(transparent, transparent))`,
                    ...style,
                } as CSSProperties
            }
        />
    );
});
