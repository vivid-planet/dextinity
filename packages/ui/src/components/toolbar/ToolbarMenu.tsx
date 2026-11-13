import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { clsx } from "clsx";
import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import { Menu, type MenuPlacement, type MenuProps } from "../menu/Menu";
import styles from "./ToolbarMenu.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type ToolbarMenuOwnerState = {
    open: boolean;
    disabled: boolean;
};

export interface ToolbarMenuSlotProps {
    /** Props for the `icon` slot, before the label. */
    icon?: SlotPropsValue<ToolbarMenuOwnerState, "span">;
    /** Props for the `label` slot. */
    label?: SlotPropsValue<ToolbarMenuOwnerState, "span">;
    /** Props for the menu, e.g. its `className`. */
    menu?: Partial<Omit<MenuProps, "trigger" | "children" | "open" | "onOpenChange" | "placement" | "disabled">>;
}

export interface ToolbarMenuProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children" | "disabled" | "aria-label"> {
    /** The entries: `MenuItem`, `MenuRadioGroup`, `MenuGroup`, `MenuSeparator`, and `MenuSubmenu`. */
    children: ReactNode;
    /** The trigger's visible text, usually the current choice, e.g. "Paragraph". */
    label?: ReactNode;
    /** An icon before the label, e.g. `<Icon name="plus" />`. */
    icon?: ReactNode;
    /** The accessible name of the trigger. Required without a text `label`, e.g. "Insert". */
    "aria-label"?: string;
    /** Whether the menu is open. */
    open: boolean;
    /** Called when the trigger, an item, Escape, or a click outside requests to open or close the menu. */
    onOpenChange: (open: boolean) => void;
    /**
     * The preferred position next to the trigger.
     *
     * @defaultValue `"bottom-start"`
     */
    placement?: MenuPlacement;
    /**
     * Prevents opening the menu. The trigger stays focusable inside the toolbar.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /** Added alongside the component's own classes, on the trigger. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: ToolbarMenuSlotProps;
}

/**
 * A trigger in a `Toolbar` that opens a menu, e.g. the text style of an editor or an insert menu.
 */
export const ToolbarMenu = forwardRef<HTMLButtonElement, ToolbarMenuProps>(function ToolbarMenu(
    { children, label, icon, "aria-label": ariaLabel, open, onOpenChange, placement, disabled = false, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: ToolbarMenuOwnerState = { open, disabled };

    const iconProps = resolveSlotProps<ToolbarMenuOwnerState, "span", "span">({
        ownProps: { className: styles.icon, "aria-hidden": true },
        slotProps: slotProps?.icon,
        ownerState,
    });
    const labelProps = resolveSlotProps<ToolbarMenuOwnerState, "span", "span">({
        ownProps: { className: styles.label },
        slotProps: slotProps?.label,
        ownerState,
    });

    return (
        <Menu
            {...slotProps?.menu}
            open={open && !disabled}
            onOpenChange={(nextOpen) => onOpenChange(nextOpen && !disabled)}
            placement={placement}
            disabled={ownerState.disabled}
            trigger={
                <BaseToolbar.Button
                    {...restProps}
                    ref={ref}
                    type="button"
                    disabled={ownerState.disabled}
                    aria-label={ariaLabel}
                    data-open={ownerState.open ? "" : undefined}
                    className={clsx(styles.root, className)}
                >
                    {icon != null && <span {...iconProps}>{icon}</span>}
                    {label != null && <span {...labelProps}>{label}</span>}
                    <Icon name="chevron-down" className={styles.chevron} />
                </BaseToolbar.Button>
            }
        >
            {children}
        </Menu>
    );
});
