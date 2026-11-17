import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { Icon } from "../icon/Icon";
import { Tooltip } from "../tooltip/Tooltip";
import styles from "./Badge.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type BadgeOwnerState = {
    variant: BadgeProps["variant"];
};

interface BadgeBaseProps extends Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children"> {
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * A badge with a number of items.
 */
export interface BadgeCountProps extends BadgeBaseProps {
    /** Shows a number of items. */
    variant: "count";
    /** The number of items. */
    children: ReactNode;
    /** The explanation, shown as a tooltip on hover and keyboard focus and read after the number. */
    tooltip?: string;
}

/**
 * A badge without text, explained by its tooltip.
 */
export interface BadgeMarkProps extends BadgeBaseProps {
    /** `warning` marks a problem such as a missing alt text, and `dot` something new or changed. */
    variant: "warning" | "dot";
    /** The explanation, shown as a tooltip on hover and keyboard focus, and the badge's accessible name. */
    tooltip: string;
}

export type BadgeProps = BadgeCountProps | BadgeMarkProps;

/**
 * Marks a real exception on an element: a missing value, a count, or something new. One badge per element at most.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(props, ref) {
    const { variant, tooltip, className, ...restProps } = props;
    const ownerState: BadgeOwnerState = { variant };
    const count = props.variant === "count" ? props.children : undefined;
    const hasText = ownerState.variant === "count";

    const badge = (
        <span
            role={hasText ? undefined : "img"}
            aria-label={hasText ? undefined : tooltip}
            tabIndex={tooltip != null ? 0 : undefined}
            {...restProps}
            ref={ref}
            data-variant={ownerState.variant}
            className={clsx(styles.root, className)}
        >
            {ownerState.variant === "warning" && <Icon name="alert" />}
            {count}
            {hasText && tooltip != null && <span className={styles.description}>{tooltip}</span>}
        </span>
    );

    return tooltip != null ? <Tooltip content={tooltip}>{badge}</Tooltip> : badge;
});
