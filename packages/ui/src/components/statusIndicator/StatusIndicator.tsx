import { clsx } from "clsx";
import { type ElementType, type ForwardedRef, forwardRef, type HTMLAttributes, type ReactNode, type RefAttributes } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Tooltip } from "../tooltip/Tooltip";
import styles from "./StatusIndicator.module.scss";

export type StatusIndicatorStatus = "published" | "unpublished" | "archived" | "warning" | "critical" | "info" | "running";

/** The text shown for each status when no `children` are given. */
export const defaultStatusIndicatorLabels: Record<StatusIndicatorStatus, string> = {
    published: "Published",
    unpublished: "Unpublished",
    archived: "Archived",
    warning: "Warning",
    critical: "Critical",
    info: "Info",
    running: "Running",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type StatusIndicatorOwnerState = {
    status: StatusIndicatorStatus;
    dotOnly: boolean;
};

export interface StatusIndicatorSlots<Dot extends ElementType> {
    /**
     * Element for the `dot` slot.
     *
     * @defaultValue `span`
     */
    dot?: Dot;
}

export interface StatusIndicatorSlotProps<Dot extends ElementType> {
    /** Props for the `dot` slot. */
    dot?: SlotPropsValue<StatusIndicatorOwnerState, Dot>;
}

export interface StatusIndicatorProps<Dot extends ElementType = "span"> extends Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children"> {
    /** Sets the color, the shape of the dot, and the default text. */
    status: StatusIndicatorStatus;
    /**
     * Custom text, e.g. "Active" for redirects. Without it, the status's system word is shown (see `defaultStatusIndicatorLabels`).
     */
    children?: ReactNode;
    /**
     * Shows only the dot, with the text as its tooltip and accessible name. Only for dense lists where the column already says what the
     * dot means. The text must then be a string; other content falls back to the system word.
     *
     * @defaultValue `false`
     */
    dotOnly?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Sets which element a named inner part renders as. */
    slots?: StatusIndicatorSlots<Dot>;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: StatusIndicatorSlotProps<Dot>;
}

/**
 * Shows a status as a dot plus text, never by color alone. The usual state stays quiet; only deviations stand out.
 */
export const StatusIndicator: <Dot extends ElementType = "span">(props: StatusIndicatorProps<Dot> & RefAttributes<HTMLSpanElement>) => ReactNode =
    forwardRef(function StatusIndicator<Dot extends ElementType = "span">(
        { status, children, dotOnly = false, className, slots, slotProps, ...restProps }: StatusIndicatorProps<Dot>,
        ref: ForwardedRef<HTMLSpanElement>,
    ) {
        const ownerState: StatusIndicatorOwnerState = { status, dotOnly };
        const label = children ?? defaultStatusIndicatorLabels[ownerState.status];

        const DotSlot: ElementType = slots?.dot ?? "span";
        const dotProps = resolveSlotProps<StatusIndicatorOwnerState, Dot, "span">({
            ownProps: { className: styles.dot, "aria-hidden": true },
            slotProps: slotProps?.dot,
            ownerState,
        });

        const rootProps = {
            ...restProps,
            ref,
            "data-status": ownerState.status,
            "data-dotonly": ownerState.dotOnly ? "" : undefined,
            className: clsx(styles.root, className),
        };

        if (ownerState.dotOnly) {
            const textLabel = typeof label === "string" ? label : defaultStatusIndicatorLabels[ownerState.status];
            return (
                <Tooltip content={textLabel}>
                    <span role="img" aria-label={textLabel} {...rootProps}>
                        <DotSlot {...dotProps} />
                    </span>
                </Tooltip>
            );
        }

        return (
            <span {...rootProps}>
                <DotSlot {...dotProps} />
                {label}
            </span>
        );
    });
