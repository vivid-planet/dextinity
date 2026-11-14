import { Menu as BaseMenu } from "@base-ui/react/menu";
import { clsx } from "clsx";
import { type ElementType, type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import styles from "./MenuRadioItem.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type MenuRadioItemOwnerState = {
    disabled: boolean;
};

export interface MenuRadioItemSlots<IconElement extends ElementType> {
    /**
     * Element for the `icon` slot.
     *
     * @defaultValue `span`
     */
    icon?: IconElement;
}

export interface MenuRadioItemSlotProps<IconElement extends ElementType> {
    /** Props for the `icon` slot. */
    icon?: SlotPropsValue<MenuRadioItemOwnerState, IconElement>;
    /** Props for the `label` slot. */
    label?: SlotPropsValue<MenuRadioItemOwnerState, "span">;
    /** Props for the `indicator` slot, the check mark of the checked option. */
    indicator?: SlotPropsValue<MenuRadioItemOwnerState, typeof BaseMenu.RadioItemIndicator>;
}

export interface MenuRadioItemProps<IconElement extends ElementType = "span"> extends Omit<
    BaseMenu.RadioItem.Props,
    "className" | "children" | "label" | "render" | "value"
> {
    /** Identifies the option within its `MenuRadioGroup`. */
    value: string;
    /** The option's name, e.g. "Dark". */
    label: string;
    /** An icon before the label. */
    icon?: ReactNode;
    /**
     * Keeps the option from being picked.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /**
     * Closes the menu when the option is picked. Turn it off to let people try several options, e.g. to compare themes.
     *
     * @defaultValue `true`
     */
    closeOnClick?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Sets which element a named inner part renders as. */
    slots?: MenuRadioItemSlots<IconElement>;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: MenuRadioItemSlotProps<IconElement>;
}

/**
 * An option in a `MenuRadioGroup`. Picking it checks it and closes the menu.
 */
export const MenuRadioItem: <IconElement extends ElementType = "span">(
    props: MenuRadioItemProps<IconElement> & RefAttributes<HTMLDivElement>,
) => ReactNode = forwardRef(function MenuRadioItem<IconElement extends ElementType = "span">(
    { value, label, icon, disabled = false, closeOnClick = true, className, slots, slotProps, ...restProps }: MenuRadioItemProps<IconElement>,
    ref: ForwardedRef<HTMLDivElement>,
) {
    const ownerState: MenuRadioItemOwnerState = { disabled };
    const IconSlot: ElementType = slots?.icon ?? "span";

    const iconProps = resolveSlotProps<MenuRadioItemOwnerState, IconElement, "span">({
        ownProps: { className: styles.icon, "aria-hidden": true },
        slotProps: slotProps?.icon,
        ownerState,
    });
    const labelProps = resolveSlotProps<MenuRadioItemOwnerState, "span", "span">({
        ownProps: { className: styles.label },
        slotProps: slotProps?.label,
        ownerState,
    });
    const indicatorProps = resolveSlotProps<MenuRadioItemOwnerState, typeof BaseMenu.RadioItemIndicator, typeof BaseMenu.RadioItemIndicator>({
        ownProps: { className: styles.indicator, children: <Icon name="check" /> },
        slotProps: slotProps?.indicator,
        ownerState,
    });

    return (
        <BaseMenu.RadioItem
            {...restProps}
            ref={ref}
            value={value}
            label={label}
            disabled={ownerState.disabled}
            closeOnClick={closeOnClick}
            className={clsx(styles.root, className)}
        >
            {icon != null && <IconSlot {...iconProps}>{icon}</IconSlot>}
            <span {...labelProps}>{label}</span>
            <BaseMenu.RadioItemIndicator {...indicatorProps} />
        </BaseMenu.RadioItem>
    );
});
