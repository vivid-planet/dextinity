import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { Icon } from "../icon/Icon";
import { Tooltip } from "../tooltip/Tooltip";
import styles from "./Badge.module.scss";

type BadgeVariant = "warning" | "count" | "dot";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type BadgeOwnerState = {
    variant: BadgeVariant;
};

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children"> {
    /**
     * `warning` marks a problem such as a missing alt text, `count` a number of items, and `dot` something new or changed.
     */
    variant: BadgeVariant;
    /** The number of a `count`; `warning` and `dot` show no text. */
    children?: ReactNode;
    /**
     * The explanation, shown as a tooltip on hover and keyboard focus. Required for `warning` and `dot`, where it is also the accessible
     * name; without it they are hidden from assistive technology.
     */
    tooltip?: string;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * Marks a real exception on an element: a missing value, a count, or something new. One badge per element at most.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({ variant, children, tooltip, className, ...restProps }, ref) {
    const ownerState: BadgeOwnerState = { variant };
    const hasText = ownerState.variant === "count";

    const badge = (
        <span
            role={hasText || tooltip == null ? undefined : "img"}
            aria-label={hasText ? undefined : tooltip}
            aria-hidden={hasText || tooltip != null ? undefined : true}
            tabIndex={tooltip != null ? 0 : undefined}
            {...restProps}
            ref={ref}
            data-variant={ownerState.variant}
            className={clsx(styles.root, className)}
        >
            {ownerState.variant === "warning" && <Icon name="error" />}
            {hasText && children}
            {hasText && tooltip != null && <span className={styles.description}>{tooltip}</span>}
        </span>
    );

    return tooltip != null ? <Tooltip content={tooltip}>{badge}</Tooltip> : badge;
});
