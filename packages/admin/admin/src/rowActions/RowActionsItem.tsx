import { type ElementType, type MouseEventHandler, type ReactElement, type ReactNode, useContext } from "react";

import { RowActionsIconItem, type RowActionsIconItemComponentsProps, type RowActionsIconItemProps } from "./RowActionsIconItem";
import { RowActionsListItem, type RowActionsListItemComponentsProps, type RowActionsListItemProps } from "./RowActionsListItem";
import { RowActionsMenuContext } from "./RowActionsMenu";

export interface CommonRowActionItemProps {
    icon?: ReactNode;
    disabled?: boolean;
    onClick?: MouseEventHandler<HTMLElement>;
}

type RowActionsItemPropsComponentsProps<T extends ElementType = "li"> = RowActionsIconItemComponentsProps & RowActionsListItemComponentsProps<T>;

export interface RowActionsItemProps<T extends ElementType = "li">
    extends Omit<RowActionsIconItemProps, "componentsProps">, Omit<RowActionsListItemProps<T>, "componentsProps"> {
    componentsProps?: RowActionsItemPropsComponentsProps<T>;
    children?: ReactNode;
}

export function RowActionsItem<MenuItemComponent extends ElementType = "li">({
    icon,
    children,
    disabled,
    onClick,
    componentsProps,
    ...restListItemProps
}: RowActionsItemProps<MenuItemComponent>): ReactElement<RowActionsItemProps<MenuItemComponent>> {
    const { level, closeAllMenus } = useContext(RowActionsMenuContext);

    if (level === 1) {
        return (
            <RowActionsIconItem
                icon={icon}
                disabled={disabled}
                tooltip={children}
                onClick={onClick}
                componentsProps={{ iconButton: componentsProps?.iconButton, tooltip: componentsProps?.tooltip }}
            />
        );
    }

    return (
        <RowActionsListItem<MenuItemComponent>
            icon={icon}
            disabled={disabled}
            onClick={(event) => {
                onClick?.(event);
                closeAllMenus?.();
            }}
            componentsProps={{
                menuItem: componentsProps?.menuItem,
                listItemIcon: componentsProps?.listItemIcon,
                listItemText: componentsProps?.listItemText,
            }}
            {...restListItemProps}
        >
            {children}
        </RowActionsListItem>
    );
}
