import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { clsx } from "clsx";
import { type ButtonHTMLAttributes, forwardRef, type MouseEvent, type ReactNode } from "react";

import { IconButton } from "../iconButton/IconButton";
import type { TooltipProps } from "../tooltip/Tooltip";
import styles from "./ToolbarButton.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type ToolbarButtonOwnerState = {
    toggle: boolean;
    pressed: boolean;
    disabled: boolean;
};

export interface ToolbarButtonSlotProps {
    /** Props for the tooltip, e.g. its `placement`. */
    tooltip?: Partial<Omit<TooltipProps, "content" | "children" | "shortcut">>;
}

export interface ToolbarButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children" | "aria-pressed"> {
    /** The icon, e.g. `<Icon name="bold" />`. */
    children: ReactNode;
    /** The accessible name, also shown as the tooltip. Name the action, e.g. "Bold". */
    "aria-label": string;
    /** A keyboard shortcut for the action, shown in the tooltip, in the notation of `useKeyboardShortcut`, e.g. `"mod+b"`. */
    shortcut?: string;
    /**
     * Makes the button a toggle and sets whether it is on, e.g. whether the text at the cursor is bold. Toggle it in `onClick`. Leave it
     * out for a plain action, e.g. undo.
     */
    pressed?: boolean;
    /**
     * Prevents interaction with the button. It stays focusable inside the toolbar.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /**
     * Keeps the focus where it is when the button is clicked, e.g. in a text editor so the selection stays.
     *
     * @defaultValue `false`
     */
    keepFocus?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: ToolbarButtonSlotProps;
}

function preventFocusLoss(event: MouseEvent) {
    event.preventDefault();
}

/**
 * An icon button in a `Toolbar`, as a plain action or a toggle. Its accessible name and shortcut show as its tooltip.
 */
export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(function ToolbarButton(
    { children, "aria-label": ariaLabel, shortcut, pressed, disabled = false, keepFocus = false, className, slotProps, onMouseDown, ...restProps },
    ref,
) {
    const ownerState: ToolbarButtonOwnerState = { toggle: pressed !== undefined, pressed: pressed === true, disabled };
    return (
        <BaseToolbar.Button
            ref={ref}
            disabled={ownerState.disabled}
            render={
                <IconButton
                    {...restProps}
                    variant="text"
                    color="secondary"
                    aria-label={ariaLabel}
                    shortcut={shortcut}
                    aria-pressed={ownerState.toggle ? ownerState.pressed : undefined}
                    data-toggle={ownerState.toggle ? "" : undefined}
                    data-pressed={ownerState.pressed ? "" : undefined}
                    className={clsx(styles.root, className)}
                    slotProps={slotProps?.tooltip != null ? { tooltip: slotProps.tooltip } : undefined}
                    onMouseDown={(event) => {
                        if (keepFocus) {
                            preventFocusLoss(event);
                        }
                        onMouseDown?.(event);
                    }}
                >
                    {children}
                </IconButton>
            }
        />
    );
});
