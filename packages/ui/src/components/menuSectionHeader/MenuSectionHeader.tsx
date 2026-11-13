import { clsx } from "clsx";
import { type ElementType, type ForwardedRef, forwardRef, type HTMLAttributes, type ReactNode, type RefAttributes } from "react";

import { hasRenderableContent } from "../../utils/hasRenderableContent";
import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import styles from "./MenuSectionHeader.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type MenuSectionHeaderOwnerState = {
    expandable: boolean;
};

type ExpandIconElementType = ElementType<{ name: "chevron-down"; className?: string }>;

interface MenuSectionHeaderSlots<Label extends ElementType, ExpandIcon extends ExpandIconElementType, Action extends ElementType> {
    /**
     * Element for the `label` slot.
     *
     * @defaultValue `span`
     */
    label?: Label;
    /**
     * Element for the `expandIcon` slot.
     *
     * @defaultValue `Icon`
     */
    expandIcon?: ExpandIcon;
    /**
     * Element for the `action` slot.
     *
     * @defaultValue `span`
     */
    action?: Action;
}

interface MenuSectionHeaderSlotProps<Label extends ElementType, ExpandIcon extends ExpandIconElementType, Action extends ElementType> {
    /** Props for the `label` slot. */
    label?: SlotPropsValue<MenuSectionHeaderOwnerState, Label>;
    /** Props for the `expandIcon` slot. */
    expandIcon?: SlotPropsValue<MenuSectionHeaderOwnerState, ExpandIcon>;
    /** Props for the `action` slot. */
    action?: SlotPropsValue<MenuSectionHeaderOwnerState, Action>;
}

export interface MenuSectionHeaderProps<
    Label extends ElementType = "span",
    ExpandIcon extends ExpandIconElementType = typeof Icon,
    Action extends ElementType = "span",
> extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
    /** The section's name. */
    children?: ReactNode;
    /**
     * Shows an expand icon for a section that expands and collapses.
     *
     * @example
     * ```tsx
     * <MenuSectionHeader expandable slots={{ label: "button" }} slotProps={{ label: { type: "button", "aria-expanded": open, onClick: toggle } }}>
     *     Content
     * </MenuSectionHeader>
     * ```
     *
     * @defaultValue `false`
     */
    expandable?: boolean;
    /** Content at the end of the header, such as a small text `IconButton` that adds an item to the section. */
    action?: ReactNode;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Sets which element a named inner part renders as. */
    slots?: MenuSectionHeaderSlots<Label, ExpandIcon, Action>;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: MenuSectionHeaderSlotProps<Label, ExpandIcon, Action>;
}

/**
 * Names a group of items in a menu, such as the main navigation.
 */
export const MenuSectionHeader: <
    Label extends ElementType = "span",
    ExpandIcon extends ExpandIconElementType = typeof Icon,
    Action extends ElementType = "span",
>(
    props: MenuSectionHeaderProps<Label, ExpandIcon, Action> & RefAttributes<HTMLDivElement>,
) => ReactNode = forwardRef(function MenuSectionHeader<
    Label extends ElementType = "span",
    ExpandIcon extends ExpandIconElementType = typeof Icon,
    Action extends ElementType = "span",
>(
    { expandable, action, className, slots, slotProps, children, ...restProps }: MenuSectionHeaderProps<Label, ExpandIcon, Action>,
    ref: ForwardedRef<HTMLDivElement>,
) {
    const ownerState: MenuSectionHeaderOwnerState = { expandable: expandable === true };

    const LabelSlot: ElementType = slots?.label ?? "span";
    const ExpandIconSlot: ElementType = slots?.expandIcon ?? Icon;
    const ActionSlot: ElementType = slots?.action ?? "span";

    const labelProps = resolveSlotProps<MenuSectionHeaderOwnerState, Label, "span">({
        ownProps: { className: styles.label },
        slotProps: slotProps?.label,
        ownerState,
    });
    const expandIconProps = resolveSlotProps<MenuSectionHeaderOwnerState, ExpandIcon, typeof Icon>({
        ownProps: { name: "chevron-down", className: styles.expandIcon },
        slotProps: slotProps?.expandIcon,
        ownerState,
    });
    const actionProps = resolveSlotProps<MenuSectionHeaderOwnerState, Action, "span">({
        ownProps: { className: styles.action },
        slotProps: slotProps?.action,
        ownerState,
    });

    return (
        <div {...restProps} ref={ref} className={clsx(styles.root, className)} data-expandable={ownerState.expandable ? "" : undefined}>
            <LabelSlot {...labelProps}>
                {children}
                {ownerState.expandable && <ExpandIconSlot {...expandIconProps} />}
            </LabelSlot>
            {hasRenderableContent(action) && <ActionSlot {...actionProps}>{action}</ActionSlot>}
        </div>
    );
});
