import { Menu as BaseMenu } from "@base-ui/react/menu";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { popupCollisionPadding } from "../../utils/popupCollisionPadding";
import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { useThemePortalContainer } from "../../utils/themePortalContainer";
import { FieldContextReset } from "../field/fieldContext";
import { Icon } from "../icon/Icon";
import styles from "./MenuSubmenu.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type MenuSubmenuOwnerState = {
    disabled: boolean;
};

export interface MenuSubmenuSlotProps {
    /** Props for the `icon` slot. */
    icon?: SlotPropsValue<MenuSubmenuOwnerState, "span">;
    /** Props for the `label` slot. */
    label?: SlotPropsValue<MenuSubmenuOwnerState, "span">;
    /** Props for the `chevron` slot. */
    chevron?: SlotPropsValue<MenuSubmenuOwnerState, "span">;
    /** Props for the `positioner` slot, which places the submenu next to its item. */
    positioner?: SlotPropsValue<MenuSubmenuOwnerState, typeof BaseMenu.Positioner>;
    /** Props for the `popup` slot, the submenu's surface. */
    popup?: SlotPropsValue<MenuSubmenuOwnerState, typeof BaseMenu.Popup>;
}

export interface MenuSubmenuProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** The item's name, e.g. "Move to". */
    label: string;
    /** The entries of the submenu. */
    children: ReactNode;
    /** An icon before the label. */
    icon?: ReactNode;
    /** Whether the submenu is open. */
    open: boolean;
    /** Called when hover, click, the arrow keys, or Escape request to open or close the submenu. */
    onOpenChange: (open: boolean) => void;
    /**
     * Keeps the submenu from opening.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: MenuSubmenuSlotProps;
}

/**
 * An item of a `Menu` that opens a nested menu, on hover, click, or the arrow key towards it.
 */
export const MenuSubmenu = forwardRef<HTMLDivElement, MenuSubmenuProps>(function MenuSubmenu(
    { label, children, icon, open, onOpenChange, disabled = false, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: MenuSubmenuOwnerState = { disabled };
    const { anchorRef, container } = useThemePortalContainer<HTMLElement>();

    const iconProps = resolveSlotProps<MenuSubmenuOwnerState, "span", "span">({
        ownProps: { className: styles.icon, "aria-hidden": true },
        slotProps: slotProps?.icon,
        ownerState,
    });
    const labelProps = resolveSlotProps<MenuSubmenuOwnerState, "span", "span">({
        ownProps: { className: styles.label },
        slotProps: slotProps?.label,
        ownerState,
    });
    const chevronProps = resolveSlotProps<MenuSubmenuOwnerState, "span", "span">({
        ownProps: { className: styles.chevron, "aria-hidden": true },
        slotProps: slotProps?.chevron,
        ownerState,
    });
    const positionerProps = resolveSlotProps<MenuSubmenuOwnerState, typeof BaseMenu.Positioner, typeof BaseMenu.Positioner>({
        ownProps: {
            side: "inline-end",
            align: "start",
            sideOffset: 2,
            alignOffset: -6,
            collisionPadding: popupCollisionPadding,
            className: styles.positioner,
        },
        slotProps: slotProps?.positioner,
        ownerState,
    });
    const popupProps = resolveSlotProps<MenuSubmenuOwnerState, typeof BaseMenu.Popup, typeof BaseMenu.Popup>({
        ownProps: { className: styles.popup },
        slotProps: slotProps?.popup,
        ownerState,
    });

    return (
        <BaseMenu.SubmenuRoot open={open} onOpenChange={(nextOpen) => onOpenChange(nextOpen)} disabled={ownerState.disabled}>
            <BaseMenu.SubmenuTrigger
                {...restProps}
                ref={(element: HTMLDivElement | null) => {
                    anchorRef(element);
                    if (typeof ref === "function") {
                        ref(element);
                    } else if (ref != null) {
                        ref.current = element;
                    }
                }}
                label={label}
                className={clsx(styles.root, className)}
            >
                {icon != null && <span {...iconProps}>{icon}</span>}
                <span {...labelProps}>{label}</span>
                <span {...chevronProps}>
                    <Icon name="chevron-right" />
                </span>
            </BaseMenu.SubmenuTrigger>
            <BaseMenu.Portal container={container}>
                <FieldContextReset>
                    <BaseMenu.Positioner {...positionerProps}>
                        <BaseMenu.Popup {...popupProps}>{children}</BaseMenu.Popup>
                    </BaseMenu.Positioner>
                </FieldContextReset>
            </BaseMenu.Portal>
        </BaseMenu.SubmenuRoot>
    );
});
