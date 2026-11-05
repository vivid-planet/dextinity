import { Menu as BaseMenu } from "@base-ui/react/menu";
import { clsx } from "clsx";
import { type ElementType, type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Kbd } from "../kbd/Kbd";
import styles from "./MenuItem.module.scss";

type MenuItemColor = "default" | "error";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type MenuItemOwnerState = {
    color: MenuItemColor;
    disabled: boolean;
};

export interface MenuItemSlots<IconElement extends ElementType> {
    /**
     * Element for the `icon` slot.
     *
     * @defaultValue `span`
     */
    icon?: IconElement;
}

export interface MenuItemSlotProps<IconElement extends ElementType> {
    /** Props for the `icon` slot. */
    icon?: SlotPropsValue<MenuItemOwnerState, IconElement>;
    /** Props for the `label` slot. */
    label?: SlotPropsValue<MenuItemOwnerState, "span">;
    /** Props for the `shortcut` slot. */
    shortcut?: SlotPropsValue<MenuItemOwnerState, typeof Kbd>;
}

export interface MenuItemProps<IconElement extends ElementType = "span"> extends Omit<
    BaseMenu.Item.Props,
    "className" | "children" | "label" | "render"
> {
    /** The action, as a verb, e.g. "Duplicate". */
    label: string;
    /** An icon before the label, e.g. `<Icon name="copy" />`. */
    icon?: ReactNode;
    /** The keyboard shortcut of the action, shown at the end, e.g. `⌘D`. */
    shortcut?: string;
    /**
     * `error` for destructive actions, e.g. Delete. Put them last, after a separator.
     *
     * @defaultValue `"default"`
     */
    color?: MenuItemColor;
    /**
     * Keeps the item from being selected; keyboard navigation still reaches it.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Sets which element a named inner part renders as. */
    slots?: MenuItemSlots<IconElement>;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: MenuItemSlotProps<IconElement>;
}

/**
 * An action in a `Menu`. `onClick` runs on click, Enter, and Space; the menu then closes.
 */
export const MenuItem: <IconElement extends ElementType = "span">(props: MenuItemProps<IconElement> & RefAttributes<HTMLDivElement>) => ReactNode =
    forwardRef(function MenuItem<IconElement extends ElementType = "span">(
        { label, icon, shortcut, color = "default", disabled = false, className, slots, slotProps, ...restProps }: MenuItemProps<IconElement>,
        ref: ForwardedRef<HTMLDivElement>,
    ) {
        const ownerState: MenuItemOwnerState = { color, disabled };
        const IconSlot: ElementType = slots?.icon ?? "span";

        const iconProps = resolveSlotProps<MenuItemOwnerState, IconElement, "span">({
            ownProps: { className: styles.icon, "aria-hidden": true },
            slotProps: slotProps?.icon,
            ownerState,
        });
        const labelProps = resolveSlotProps<MenuItemOwnerState, "span", "span">({
            ownProps: { className: styles.label },
            slotProps: slotProps?.label,
            ownerState,
        });
        const shortcutProps = resolveSlotProps<MenuItemOwnerState, typeof Kbd, typeof Kbd>({
            ownProps: { className: styles.shortcut, children: shortcut },
            slotProps: slotProps?.shortcut,
            ownerState,
        });

        return (
            <BaseMenu.Item
                {...restProps}
                ref={ref}
                label={label}
                disabled={ownerState.disabled}
                data-color={ownerState.color}
                className={clsx(styles.root, className)}
            >
                {icon != null && <IconSlot {...iconProps}>{icon}</IconSlot>}
                <span {...labelProps}>{label}</span>
                {shortcut != null && <Kbd {...shortcutProps} />}
            </BaseMenu.Item>
        );
    });
