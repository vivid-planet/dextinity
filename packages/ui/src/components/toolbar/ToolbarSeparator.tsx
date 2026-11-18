import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes } from "react";

import styles from "./ToolbarSeparator.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type ToolbarSeparatorOwnerState = Record<string, never>;

export interface ToolbarSeparatorProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * A line between groups of controls in a `Toolbar`. It follows the toolbar's orientation.
 */
export const ToolbarSeparator = forwardRef<HTMLDivElement, ToolbarSeparatorProps>(function ToolbarSeparator({ className, ...restProps }, ref) {
    return <BaseToolbar.Separator {...restProps} ref={ref} className={clsx(styles.root, className)} />;
});
