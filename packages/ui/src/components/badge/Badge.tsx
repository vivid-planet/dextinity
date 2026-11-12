import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { Icon } from "../icon/Icon";
import { Tooltip } from "../tooltip/Tooltip";
import styles from "./Badge.module.scss";

type BadgeVariant = "ai" | "warning" | "count" | "dot";

const defaultAiText = "AI";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type BadgeOwnerState = {
    variant: BadgeVariant;
};

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children"> {
    /**
     * `ai` marks AI-generated content (EU AI Act), `warning` a problem such as a missing alt text, `count` a number of items, and `dot`
     * something new or changed.
     */
    variant: BadgeVariant;
    /** The text or number. `ai` defaults to "AI"; `warning` and `dot` show no text. */
    children?: ReactNode;
    /**
     * The explanation, shown as a tooltip on hover and keyboard focus. Required for `ai`, `warning`, and `dot`; for `warning` and `dot` it
     * is also the accessible name, and without it they are hidden from assistive technology.
     */
    tooltip?: string;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * Marks a real exception on an element: AI-generated, a missing value, a count, or something new. One badge per element at most.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({ variant, children, tooltip, className, ...restProps }, ref) {
    const ownerState: BadgeOwnerState = { variant };
    const hasText = ownerState.variant === "ai" || ownerState.variant === "count";
    const text = ownerState.variant === "ai" ? (children ?? defaultAiText) : children;

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
            {ownerState.variant === "warning" && <Icon name="alert" />}
            {hasText && text}
            {hasText && tooltip != null && <span className={styles.description}>{tooltip}</span>}
        </span>
    );

    return tooltip != null ? <Tooltip content={tooltip}>{badge}</Tooltip> : badge;
});
