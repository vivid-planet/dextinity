import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import styles from "./Toolbar.module.scss";

type ToolbarOrientation = "horizontal" | "vertical";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type ToolbarOwnerState = {
    orientation: ToolbarOrientation;
    disabled: boolean;
};

export interface ToolbarProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** The controls: `ToolbarButton`, `ToolbarMenu`, `ToolbarGroup`, and `ToolbarSeparator`. */
    children: ReactNode;
    /** The accessible name, e.g. "Formatting". */
    "aria-label": string;
    /**
     * Lays the controls out in a row or a column. Arrow keys follow the direction.
     *
     * @defaultValue `"horizontal"`
     */
    orientation?: ToolbarOrientation;
    /**
     * Prevents interaction with all controls. They stay focusable, so the toolbar is still discoverable by keyboard.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * A row of controls for a shared context, e.g. the formatting of a text editor. Tab moves into the toolbar once, arrow keys move between
 * its controls.
 */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
    { children, orientation = "horizontal", disabled = false, className, ...restProps },
    ref,
) {
    const ownerState: ToolbarOwnerState = { orientation, disabled };
    return (
        <BaseToolbar.Root
            {...restProps}
            ref={ref}
            orientation={ownerState.orientation}
            disabled={ownerState.disabled}
            className={clsx(styles.root, className)}
        >
            {children}
        </BaseToolbar.Root>
    );
});
