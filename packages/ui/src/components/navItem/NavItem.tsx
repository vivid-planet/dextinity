import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import { type AnchorHTMLAttributes, type ElementType, type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";

import { hasRenderableContent } from "../../utils/hasRenderableContent";
import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import styles from "./NavItem.module.scss";

type NavItemLevel = 1 | 2 | 3;

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type NavItemOwnerState = {
    level: NavItemLevel;
    active: boolean;
    expandable: boolean;
};

type ExpandIconElementType = ElementType<{ name: "chevron-down"; className?: string }>;

interface NavItemSlots<
    ActiveIndicator extends ElementType,
    Content extends ElementType,
    IconSlot extends ElementType,
    Label extends ElementType,
    ExpandIcon extends ExpandIconElementType,
> {
    /**
     * Element for the `activeIndicator` slot.
     *
     * @defaultValue `span`
     */
    activeIndicator?: ActiveIndicator;
    /**
     * Element for the `content` slot.
     *
     * @defaultValue `span`
     */
    content?: Content;
    /**
     * Element for the `icon` slot.
     *
     * @defaultValue `span`
     */
    icon?: IconSlot;
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
}

interface NavItemSlotProps<
    ActiveIndicator extends ElementType,
    Content extends ElementType,
    IconSlot extends ElementType,
    Label extends ElementType,
    ExpandIcon extends ExpandIconElementType,
> {
    /** Props for the `activeIndicator` slot. */
    activeIndicator?: SlotPropsValue<NavItemOwnerState, ActiveIndicator>;
    /** Props for the `content` slot. */
    content?: SlotPropsValue<NavItemOwnerState, Content>;
    /** Props for the `icon` slot. */
    icon?: SlotPropsValue<NavItemOwnerState, IconSlot>;
    /** Props for the `label` slot. */
    label?: SlotPropsValue<NavItemOwnerState, Label>;
    /** Props for the `expandIcon` slot. */
    expandIcon?: SlotPropsValue<NavItemOwnerState, ExpandIcon>;
}

export interface NavItemProps<
    ActiveIndicator extends ElementType = "span",
    Content extends ElementType = "span",
    IconSlot extends ElementType = "span",
    Label extends ElementType = "span",
    ExpandIcon extends ExpandIconElementType = typeof Icon,
> extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className"> {
    /** The icon to render before the label. */
    icon?: ReactNode;
    /**
     * The nesting depth in the navigation, which sets the indentation.
     *
     * @defaultValue `1`
     */
    level?: NavItemLevel;
    /**
     * Marks the item of the current page.
     *
     * @defaultValue `false`
     */
    active?: boolean;
    /**
     * Shows an expand icon for an item that has nested items.
     *
     * @defaultValue `false`
     */
    expandable?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Sets which element a named inner part renders as. */
    slots?: NavItemSlots<ActiveIndicator, Content, IconSlot, Label, ExpandIcon>;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: NavItemSlotProps<ActiveIndicator, Content, IconSlot, Label, ExpandIcon>;
    /**
     * Render a custom root element, such as a router link, or a `<button>` for an item that expands.
     *
     * @example
     * ```tsx
     * <NavItem render={<Link to="/pages" />}>Pages</NavItem>
     * ```
     */
    render?: useRender.RenderProp<NavItemOwnerState>;
}

/**
 * An entry in the main navigation of an application.
 */
export const NavItem: <
    ActiveIndicator extends ElementType = "span",
    Content extends ElementType = "span",
    IconSlot extends ElementType = "span",
    Label extends ElementType = "span",
    ExpandIcon extends ExpandIconElementType = typeof Icon,
>(
    props: NavItemProps<ActiveIndicator, Content, IconSlot, Label, ExpandIcon> & RefAttributes<HTMLElement>,
) => ReactNode = forwardRef(function NavItem<
    ActiveIndicator extends ElementType = "span",
    Content extends ElementType = "span",
    IconSlot extends ElementType = "span",
    Label extends ElementType = "span",
    ExpandIcon extends ExpandIconElementType = typeof Icon,
>(
    {
        icon,
        level = 1,
        active,
        expandable,
        className,
        slots,
        slotProps,
        children,
        render,
        ...restProps
    }: NavItemProps<ActiveIndicator, Content, IconSlot, Label, ExpandIcon>,
    ref: ForwardedRef<HTMLElement>,
) {
    const ownerState: NavItemOwnerState = { level, active: active === true, expandable: expandable === true };

    const ActiveIndicatorSlot: ElementType = slots?.activeIndicator ?? "span";
    const ContentSlot: ElementType = slots?.content ?? "span";
    const IconSlotElement: ElementType = slots?.icon ?? "span";
    const LabelSlot: ElementType = slots?.label ?? "span";
    const ExpandIconSlot: ElementType = slots?.expandIcon ?? Icon;

    const activeIndicatorProps = resolveSlotProps<NavItemOwnerState, ActiveIndicator, "span">({
        ownProps: { className: styles.activeIndicator },
        slotProps: slotProps?.activeIndicator,
        ownerState,
    });
    const contentProps = resolveSlotProps<NavItemOwnerState, Content, "span">({
        ownProps: { className: styles.content },
        slotProps: slotProps?.content,
        ownerState,
    });
    const iconProps = resolveSlotProps<NavItemOwnerState, IconSlot, "span">({
        ownProps: { className: styles.icon },
        slotProps: slotProps?.icon,
        ownerState,
    });
    const labelProps = resolveSlotProps<NavItemOwnerState, Label, "span">({
        ownProps: { className: styles.label },
        slotProps: slotProps?.label,
        ownerState,
    });
    const expandIconProps = resolveSlotProps<NavItemOwnerState, ExpandIcon, typeof Icon>({
        ownProps: { name: "chevron-down", className: styles.expandIcon },
        slotProps: slotProps?.expandIcon,
        ownerState,
    });

    return useRender({
        render,
        ref,
        state: ownerState,
        defaultTagName: "a",
        props: {
            "aria-current": ownerState.active ? "page" : undefined,
            ...restProps,
            className: clsx(styles.root, className),
            children: (
                <>
                    <ActiveIndicatorSlot {...activeIndicatorProps} />
                    <ContentSlot {...contentProps}>
                        {hasRenderableContent(icon) && <IconSlotElement {...iconProps}>{icon}</IconSlotElement>}
                        <LabelSlot {...labelProps}>{children}</LabelSlot>
                        {ownerState.expandable && <ExpandIconSlot {...expandIconProps} />}
                    </ContentSlot>
                </>
            ),
        },
    });
});
