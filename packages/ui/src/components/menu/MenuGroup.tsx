import { Menu as BaseMenu } from "@base-ui/react/menu";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import styles from "./MenuGroup.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type MenuGroupOwnerState = Record<string, never>;

export interface MenuGroupSlotProps {
    /** Props for the `label` slot. */
    label?: SlotPropsValue<MenuGroupOwnerState, typeof BaseMenu.GroupLabel>;
}

export interface MenuGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** What the items act on or choose, e.g. "3 items" or "Theme". */
    label: string;
    /** The items of the group. */
    children: ReactNode;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: MenuGroupSlotProps;
}

/**
 * Items of a `Menu` under a heading. Menus with more than ten items use groups.
 */
export const MenuGroup = forwardRef<HTMLDivElement, MenuGroupProps>(function MenuGroup({ label, children, className, slotProps, ...restProps }, ref) {
    const ownerState: MenuGroupOwnerState = {};
    const labelProps = resolveSlotProps<MenuGroupOwnerState, typeof BaseMenu.GroupLabel, typeof BaseMenu.GroupLabel>({
        ownProps: { className: styles.label, children: label },
        slotProps: slotProps?.label,
        ownerState,
    });

    return (
        <BaseMenu.Group {...restProps} ref={ref} className={clsx(styles.root, className)}>
            <BaseMenu.GroupLabel {...labelProps} />
            {children}
        </BaseMenu.Group>
    );
});
