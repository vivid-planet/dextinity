import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import styles from "./ToolbarGroup.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type ToolbarGroupOwnerState = {
    disabled: boolean;
};

export interface ToolbarGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** The controls of the group. */
    children: ReactNode;
    /** The accessible name of the group, e.g. "Text style". */
    "aria-label"?: string;
    /**
     * Prevents interaction with the group's controls.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * Related controls inside a `Toolbar`, e.g. bold and italic. Separate groups with `ToolbarSeparator`.
 */
export const ToolbarGroup = forwardRef<HTMLDivElement, ToolbarGroupProps>(function ToolbarGroup(
    { children, disabled = false, className, ...restProps },
    ref,
) {
    const ownerState: ToolbarGroupOwnerState = { disabled };
    return (
        <BaseToolbar.Group {...restProps} ref={ref} disabled={ownerState.disabled} className={clsx(styles.root, className)}>
            {children}
        </BaseToolbar.Group>
    );
});
