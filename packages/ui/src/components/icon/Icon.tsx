import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import styles from "./Icon.module.scss";
import type { IconName } from "./iconRegistry";
import { useIconUrls } from "./iconUrlsContext";

export interface IconProps extends Omit<ComponentPropsWithoutRef<"svg">, "children"> {
    /** The name of the icon, one of the keys of `IconRegistry`. */
    icon: IconName;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Names the icon for assistive technology. Without it or `aria-labelledby`, the icon is hidden from assistive technology. */
    "aria-label"?: string;
}

/**
 * Shows an icon from the icon set of the surrounding `Theme`. It is 16×16 pixels and uses the current text color.
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
    { icon, className, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...restProps },
    ref,
) {
    const iconUrls = useIconUrls();
    if (iconUrls === undefined) {
        throw new Error("`Icon` must be rendered inside a `Theme`.");
    }
    const iconUrl = iconUrls[icon];
    if (iconUrl === undefined) {
        throw new Error(`The icon "${icon}" has no URL. Add it to the \`icons\` of \`Theme\`.`);
    }

    const isLabeled = ariaLabel !== undefined || ariaLabelledBy !== undefined;

    return (
        <svg
            ref={ref}
            viewBox="0 0 16 16"
            width={16}
            height={16}
            aria-hidden={isLabeled ? undefined : true}
            role={isLabeled ? "img" : undefined}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            {...restProps}
            className={clsx(styles.root, className)}
        >
            <use href={iconUrl} />
        </svg>
    );
});
