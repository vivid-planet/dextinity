import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes } from "react";

import { Tooltip } from "../tooltip/Tooltip";
import styles from "./EnvironmentLabel.module.scss";

export type EnvironmentLabelColor = "info" | "success" | "warning" | "error";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type EnvironmentLabelOwnerState = {
    color: EnvironmentLabelColor;
    variant: "default" | "compact";
};

export interface EnvironmentLabelProps extends Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children" | "color"> {
    /** The name of the instance, e.g. "Staging". */
    label: string;
    /**
     * The instance's color, the warmer the closer it is to the live system: e.g. `info` for development, `success` for test,
     * `warning` for staging, and `error` for pre-live.
     *
     * @defaultValue `"warning"`
     */
    color?: EnvironmentLabelColor;
    /**
     * `compact` shows only the first letter, e.g. on a collapsed navigation, and the full name in a tooltip and to screen readers.
     *
     * @defaultValue `"default"`
     */
    variant?: "default" | "compact";
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * Names the instance an app runs on, e.g. Staging, so that nobody mistakes it for the live system. The live system shows none.
 * Inside an `AppShell`, set its `environment` instead: the shell places the label and draws a line in its color along the top edge.
 */
export const EnvironmentLabel = forwardRef<HTMLSpanElement, EnvironmentLabelProps>(function EnvironmentLabel(
    { label, color = "warning", variant = "default", className, ...restProps },
    ref,
) {
    const ownerState: EnvironmentLabelOwnerState = { color, variant };
    const isCompact = ownerState.variant === "compact";
    const element = (
        <span
            tabIndex={isCompact ? 0 : undefined}
            {...restProps}
            ref={ref}
            data-color={ownerState.color}
            data-variant={ownerState.variant}
            className={clsx(styles.root, className)}
        >
            {isCompact ? (
                <>
                    <span aria-hidden>{label.slice(0, 1)}</span>
                    <span className={styles.name}>{label}</span>
                </>
            ) : (
                label
            )}
        </span>
    );
    return isCompact ? <Tooltip content={label}>{element}</Tooltip> : element;
});
