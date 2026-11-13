import { Toggle } from "@base-ui/react/toggle";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef, type MouseEvent, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import { StatusIndicator, type StatusIndicatorStatus } from "../statusIndicator/StatusIndicator";
import styles from "./FilterChip.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type FilterChipOwnerState = {
    selected: boolean;
    disabled: boolean;
    hasMenu: boolean;
};

export interface FilterChipSlotProps {
    /** Props for the `label` slot. */
    label?: SlotPropsValue<FilterChipOwnerState, "span">;
    /** Props for the `count` slot. */
    count?: SlotPropsValue<FilterChipOwnerState, "span">;
    /** Props for the `menuIcon` slot. */
    menuIcon?: SlotPropsValue<FilterChipOwnerState, "span">;
}

export interface FilterChipProps extends Omit<
    ComponentPropsWithoutRef<typeof Toggle>,
    "className" | "children" | "onClick" | "pressed" | "defaultPressed" | "onPressedChange" | "value"
> {
    /** The label, one line. */
    children: ReactNode;
    /** Whether the filter is active. */
    selected: boolean;
    /** Called when the chip is clicked, to toggle the filter or open its menu. */
    onClick: (event: MouseEvent<HTMLButtonElement>) => void;
    /** The number of matching items, shown after the label. */
    count?: number;
    /** Shows the status's dot before the label, for filters by status. */
    status?: StatusIndicatorStatus;
    /**
     * Shows a chevron after the label: the chip opens a menu to pick the filter's value. Render the chip as the menu's trigger.
     *
     * @defaultValue `false`
     */
    hasMenu?: boolean;
    /**
     * Prevents interaction with the chip.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: FilterChipSlotProps;
}

/**
 * A quick filter above a list, with the number of matching items. Toggles the filter, or opens a menu to pick its value.
 */
export const FilterChip = forwardRef<HTMLButtonElement, FilterChipProps>(function FilterChip(
    { children, selected, onClick, count, status, hasMenu = false, disabled = false, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: FilterChipOwnerState = { selected, disabled, hasMenu };

    const labelProps = resolveSlotProps<FilterChipOwnerState, "span", "span">({
        ownProps: { className: styles.label },
        slotProps: slotProps?.label,
        ownerState,
    });
    const countProps = resolveSlotProps<FilterChipOwnerState, "span", "span">({
        ownProps: { className: styles.count },
        slotProps: slotProps?.count,
        ownerState,
    });
    const menuIconProps = resolveSlotProps<FilterChipOwnerState, "span", "span">({
        ownProps: { className: styles.menuIcon, "aria-hidden": true },
        slotProps: slotProps?.menuIcon,
        ownerState,
    });

    return (
        <Toggle
            {...restProps}
            ref={ref}
            pressed={ownerState.selected}
            disabled={ownerState.disabled}
            onClick={onClick}
            data-selected={ownerState.selected ? "" : undefined}
            data-hasmenu={ownerState.hasMenu ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            {status != null ? (
                <StatusIndicator status={status} {...labelProps}>
                    {children}
                </StatusIndicator>
            ) : (
                <span {...labelProps}>{children}</span>
            )}
            {count != null && <span {...countProps}>{count}</span>}
            {ownerState.hasMenu && (
                <span {...menuIconProps}>
                    <Icon name="chevron-down" />
                </span>
            )}
        </Toggle>
    );
});
