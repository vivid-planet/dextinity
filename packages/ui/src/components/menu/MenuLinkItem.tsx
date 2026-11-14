import { Menu as BaseMenu } from "@base-ui/react/menu";
import { clsx } from "clsx";
import { forwardRef, type MouseEvent, type ReactNode } from "react";

import { isModifiedClick } from "../../utils/modifiedClick";
import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import styles from "./MenuLinkItem.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type MenuLinkItemOwnerState = Record<string, never>;

export interface MenuLinkItemSlotProps {
    /** Props for the `icon` slot. */
    icon?: SlotPropsValue<MenuLinkItemOwnerState, "span">;
    /** Props for the `label` slot. */
    label?: SlotPropsValue<MenuLinkItemOwnerState, "span">;
}

export interface MenuLinkItemProps extends Omit<BaseMenu.LinkItem.Props, "className" | "children" | "label" | "onClick"> {
    /** Where the link leads, e.g. "Careers". */
    label: string;
    /** The destination. */
    href?: string;
    /**
     * Called when the link is chosen, e.g. to navigate with the router, instead of following `href`. A click with a modifier key or
     * the middle button still follows the link, e.g. into a new tab.
     */
    onClick?: () => void;
    /** An icon before the label, e.g. `<Icon name="sitemap" />`. */
    icon?: ReactNode;
    /**
     * Whether choosing the link closes the menu.
     *
     * @defaultValue `true`
     */
    closeOnClick?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: MenuLinkItemSlotProps;
}

/**
 * A link in a `Menu`, e.g. to a level collapsed out of the breadcrumbs: it opens in place, and in a new tab with a modifier key, the
 * middle button, or the browser's context menu.
 */
export const MenuLinkItem = forwardRef<HTMLAnchorElement, MenuLinkItemProps>(function MenuLinkItem(
    { label, href, onClick, icon, closeOnClick = true, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: MenuLinkItemOwnerState = {};

    const iconProps = resolveSlotProps<MenuLinkItemOwnerState, "span", "span">({
        ownProps: { className: styles.icon, "aria-hidden": true },
        slotProps: slotProps?.icon,
        ownerState,
    });
    const labelProps = resolveSlotProps<MenuLinkItemOwnerState, "span", "span">({
        ownProps: { className: styles.label },
        slotProps: slotProps?.label,
        ownerState,
    });

    return (
        <BaseMenu.LinkItem
            {...restProps}
            ref={ref}
            href={href}
            label={label}
            closeOnClick={closeOnClick}
            className={clsx(styles.root, className)}
            onClick={
                onClick == null
                    ? undefined
                    : (event: MouseEvent<HTMLAnchorElement>) => {
                          if (isModifiedClick(event)) {
                              return;
                          }
                          event.preventDefault();
                          onClick();
                      }
            }
        >
            {icon != null && <span {...iconProps}>{icon}</span>}
            <span {...labelProps}>{label}</span>
        </BaseMenu.LinkItem>
    );
});
