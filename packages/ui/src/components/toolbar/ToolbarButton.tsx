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
    selected: boolean;
    disabled: boolean;
};

export interface ToolbarButtonSlotProps {
    /** Props for the tooltip, e.g. its `placement`. */
    tooltip?: Partial<Omit<TooltipProps, "content" | "children" | "keyboardShortcut">>;
}

export interface ToolbarButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children" | "aria-pressed"> {
    /** The accessible name, also shown as the tooltip. Name the action, e.g. "Bold". */
    "aria-label": string;
    /** A keyboard shortcut for the action, shown in the tooltip, in the notation of `useKeyboardShortcut`, e.g. `"mod+b"`. */
    keyboardShortcut?: string;
    /**
     * Makes the button a toggle and sets whether it is on, e.g. whether the text at the cursor is bold. It is announced as pressed
     * (`aria-pressed`). Leave it out for a plain action, e.g. undo.
     */
    selected?: boolean;
    /** Called with the new state when the toggle is clicked. */
    onSelectedChange?: (selected: boolean) => void;
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
    /** The icon, e.g. `<Icon name="bold" />`. */
    children: ReactNode;
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
    {
        children,
        "aria-label": ariaLabel,
        keyboardShortcut,
        selected,
        onSelectedChange,
        disabled = false,
        keepFocus = false,
        className,
        slotProps,
        onClick,
        onMouseDown,
        ...restProps
    },
    ref,
) {
    const ownerState: ToolbarButtonOwnerState = { toggle: selected !== undefined, selected: selected === true, disabled };
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
                    keyboardShortcut={keyboardShortcut}
                    aria-pressed={ownerState.toggle ? ownerState.selected : undefined}
                    data-toggle={ownerState.toggle ? "" : undefined}
                    data-selected={ownerState.selected ? "" : undefined}
                    className={clsx(styles.root, className)}
                    slotProps={slotProps?.tooltip != null ? { tooltip: slotProps.tooltip } : undefined}
                    onClick={(event) => {
                        onClick?.(event);
                        if (ownerState.toggle) {
                            onSelectedChange?.(!ownerState.selected);
                        }
                    }}
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
