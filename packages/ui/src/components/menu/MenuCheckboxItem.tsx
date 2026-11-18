import { Menu as BaseMenu } from "@base-ui/react/menu";
import { clsx } from "clsx";
import { type ElementType, type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import styles from "./MenuCheckboxItem.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type MenuCheckboxItemOwnerState = {
    checked: boolean;
    disabled: boolean;
};

export interface MenuCheckboxItemSlots<IconElement extends ElementType> {
    /**
     * Element for the `icon` slot.
     *
     * @defaultValue `span`
     */
    icon?: IconElement;
}

export interface MenuCheckboxItemSlotProps<IconElement extends ElementType> {
    /** Props for the `icon` slot. */
    icon?: SlotPropsValue<MenuCheckboxItemOwnerState, IconElement>;
    /** Props for the `label` slot. */
    label?: SlotPropsValue<MenuCheckboxItemOwnerState, "span">;
    /** Props for the `indicator` slot, the check mark while checked. */
    indicator?: SlotPropsValue<MenuCheckboxItemOwnerState, typeof BaseMenu.CheckboxItemIndicator>;
}

export interface MenuCheckboxItemProps<IconElement extends ElementType = "span"> extends Omit<
    BaseMenu.CheckboxItem.Props,
    "className" | "children" | "label" | "render" | "checked" | "defaultChecked" | "onCheckedChange" | "onChange"
> {
    /** The option's name, e.g. "Location". */
    label: string;
    /** Whether the option is on. */
    checked: boolean;
    /** Called with the new state when the item is picked. */
    onChange: (checked: boolean) => void;
    /** An icon before the label. */
    icon?: ReactNode;
    /**
     * Keeps the option from being changed; keyboard navigation still reaches it.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /**
     * Closes the menu when the item is picked. Keep it open to switch several options in a row.
     *
     * @defaultValue `false`
     */
    closeOnClick?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Sets which element a named inner part renders as. */
    slots?: MenuCheckboxItemSlots<IconElement>;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: MenuCheckboxItemSlotProps<IconElement>;
}

/**
 * An option in a `Menu` that is switched on and off, e.g. a column in a "Columns" menu. The checked option shows a check mark.
 */
export const MenuCheckboxItem: <IconElement extends ElementType = "span">(
    props: MenuCheckboxItemProps<IconElement> & RefAttributes<HTMLDivElement>,
) => ReactNode = forwardRef(function MenuCheckboxItem<IconElement extends ElementType = "span">(
    {
        label,
        checked,
        onChange,
        icon,
        disabled = false,
        closeOnClick = false,
        className,
        slots,
        slotProps,
        ...restProps
    }: MenuCheckboxItemProps<IconElement>,
    ref: ForwardedRef<HTMLDivElement>,
) {
    const ownerState: MenuCheckboxItemOwnerState = { checked, disabled };
    const IconSlot: ElementType = slots?.icon ?? "span";

    const iconProps = resolveSlotProps<MenuCheckboxItemOwnerState, IconElement, "span">({
        ownProps: { className: styles.icon, "aria-hidden": true },
        slotProps: slotProps?.icon,
        ownerState,
    });
    const labelProps = resolveSlotProps<MenuCheckboxItemOwnerState, "span", "span">({
        ownProps: { className: styles.label },
        slotProps: slotProps?.label,
        ownerState,
    });
    const indicatorProps = resolveSlotProps<MenuCheckboxItemOwnerState, typeof BaseMenu.CheckboxItemIndicator, typeof BaseMenu.CheckboxItemIndicator>(
        {
            ownProps: { className: styles.indicator, keepMounted: true, children: <Icon name="check" /> },
            slotProps: slotProps?.indicator,
            ownerState,
        },
    );

    return (
        <BaseMenu.CheckboxItem
            {...restProps}
            ref={ref}
            label={label}
            checked={checked}
            onCheckedChange={(nextChecked) => onChange(nextChecked)}
            disabled={ownerState.disabled}
            closeOnClick={closeOnClick}
            className={clsx(styles.root, className)}
        >
            {icon != null && <IconSlot {...iconProps}>{icon}</IconSlot>}
            <span {...labelProps}>{label}</span>
            <BaseMenu.CheckboxItemIndicator {...indicatorProps} />
        </BaseMenu.CheckboxItem>
    );
});
