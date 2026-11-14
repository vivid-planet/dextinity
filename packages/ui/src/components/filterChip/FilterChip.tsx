import { Toggle } from "@base-ui/react/toggle";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef, type MouseEvent, type ReactNode } from "react";

import { hasRenderableContent } from "../../utils/hasRenderableContent";
import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
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
    /** Props for the `startAdornment` slot, the wrapper around `startAdornment`. */
    startAdornment?: SlotPropsValue<FilterChipOwnerState, "span">;
    /** Props for the `label` slot. */
    label?: SlotPropsValue<FilterChipOwnerState, "span">;
    /** Props for the `endAdornment` slot, the wrapper around `endAdornment`. */
    endAdornment?: SlotPropsValue<FilterChipOwnerState, "span">;
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
    /**
     * Content before the label, such as a status dot, an icon, or an avatar. It is part of the chip's accessible name, so hide purely
     * decorative content from assistive technology, e.g. `<StatusIndicator status="published" decorative />`. It renders inside the
     * chip's button, so it must not be interactive: no buttons, links, or other focusable content.
     */
    startAdornment?: ReactNode;
    /**
     * Content after the label, before the count and the chevron. Part of the chip's accessible name and must not be interactive, like
     * `startAdornment`.
     */
    endAdornment?: ReactNode;
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
    { children, selected, onClick, count, startAdornment, endAdornment, hasMenu = false, disabled = false, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: FilterChipOwnerState = { selected, disabled, hasMenu };

    const startAdornmentProps = resolveSlotProps<FilterChipOwnerState, "span", "span">({
        ownProps: { className: styles.startAdornment },
        slotProps: slotProps?.startAdornment,
        ownerState,
    });
    const endAdornmentProps = resolveSlotProps<FilterChipOwnerState, "span", "span">({
        ownProps: { className: styles.endAdornment },
        slotProps: slotProps?.endAdornment,
        ownerState,
    });
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
            {hasRenderableContent(startAdornment) && <span {...startAdornmentProps}>{startAdornment}</span>}
            <span {...labelProps}>{children}</span>
            {hasRenderableContent(endAdornment) && <span {...endAdornmentProps}>{endAdornment}</span>}
            {count != null && <span {...countProps}>{count}</span>}
            {ownerState.hasMenu && (
                <span {...menuIconProps}>
                    <Icon name="chevron-down" />
                </span>
            )}
        </Toggle>
    );
});
