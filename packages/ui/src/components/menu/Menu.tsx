import { Menu as BaseMenu } from "@base-ui/react/menu";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactElement, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { useThemePortalContainer } from "../../utils/themePortalContainer";
import styles from "./Menu.module.scss";

export type MenuPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type MenuOwnerState = {
    placement: MenuPlacement;
    disabled: boolean;
};

export interface MenuSlotProps {
    /** Props for the `positioner` slot, which places the menu next to its trigger. */
    positioner?: SlotPropsValue<MenuOwnerState, typeof BaseMenu.Positioner>;
}

export interface MenuProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** The element that opens the menu, e.g. an `IconButton`. It must accept a ref and event handlers; it gets `aria-haspopup` and `aria-expanded`. */
    trigger: ReactElement;
    /** The entries: `MenuItem`, `MenuCheckboxItem`, `MenuRadioGroup`, `MenuGroup`, `MenuSeparator`, and `MenuSubmenu`. */
    children: ReactNode;
    /** Whether the menu is open. */
    open: boolean;
    /** Called when the trigger, an item, Escape, or a click outside requests to open or close the menu. */
    onOpenChange: (open: boolean) => void;
    /**
     * The preferred position next to the trigger. The menu flips when there isn't enough room.
     *
     * @defaultValue `"bottom-start"`
     */
    placement?: MenuPlacement;
    /**
     * Prevents opening the menu and marks the trigger as disabled.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: MenuSlotProps;
}

/**
 * A list of actions at a trigger. Arrow keys move through the items, Enter selects, Escape closes.
 */
export const Menu = forwardRef<HTMLDivElement, MenuProps>(function Menu(
    { trigger, children, open, onOpenChange, placement = "bottom-start", disabled = false, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: MenuOwnerState = { placement, disabled };
    const { anchorRef, container } = useThemePortalContainer<HTMLElement>();
    const [side, align] = ownerState.placement.split("-") as ["bottom" | "top", "start" | "end"];

    const positionerProps = resolveSlotProps<MenuOwnerState, typeof BaseMenu.Positioner, typeof BaseMenu.Positioner>({
        ownProps: { side, align, sideOffset: 6, collisionPadding: 8, className: styles.positioner },
        slotProps: slotProps?.positioner,
        ownerState,
    });

    return (
        <BaseMenu.Root open={open} onOpenChange={(nextOpen) => onOpenChange(nextOpen)} modal={false}>
            <BaseMenu.Trigger ref={anchorRef} render={trigger} disabled={ownerState.disabled} />
            <BaseMenu.Portal container={container}>
                <BaseMenu.Positioner {...positionerProps}>
                    <BaseMenu.Popup {...restProps} ref={ref} data-placement={ownerState.placement} className={clsx(styles.root, className)}>
                        {children}
                    </BaseMenu.Popup>
                </BaseMenu.Positioner>
            </BaseMenu.Portal>
        </BaseMenu.Root>
    );
});
