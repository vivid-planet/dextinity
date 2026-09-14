import { ChevronRight, MoreVertical } from "@dextinity/admin-icons";
import { Menu, type MenuProps } from "@mui/material";
import { type ReactNode, useContext, useRef } from "react";

import { RowActionsIconItem, type RowActionsIconItemProps } from "./RowActionsIconItem";
import { RowActionsListItem, type RowActionsListItemProps } from "./RowActionsListItem";
import { RowActionsMenuContext } from "./RowActionsMenu";

interface RowActionsSubMenuComponentsProps {
    rowActionsIconItem?: Partial<RowActionsIconItemProps>;
    rowActionsListItem?: Partial<RowActionsListItemProps>;
}

export interface RowActionsSubMenuProps extends Omit<MenuProps, "open" | "onClose" | "componentsProps"> {
    icon?: ReactNode;
    text?: ReactNode;
    menuIsOpen: boolean;
    closeMenu: () => void;
    openMenu: () => void;
    textSecondary?: ReactNode;
    endIcon?: ReactNode;
    componentsProps?: RowActionsSubMenuComponentsProps & MenuProps["componentsProps"];
}

export const RowActionsSubMenu = ({
    icon = <MoreVertical />,
    endIcon = <ChevronRight />,
    text,
    textSecondary,
    menuIsOpen,
    openMenu,
    closeMenu,
    componentsProps = {},
    ...restMenuProps
}: RowActionsSubMenuProps) => {
    const { level } = useContext(RowActionsMenuContext);
    const menuIconItemButtonRef = useRef<HTMLButtonElement>(null);
    const menuListItemButtonRef = useRef<HTMLLIElement>(null);
    const showMenuButtonAsIconButton = level === 2;
    const { rowActionsIconItem: rowActionsIconItemProps, rowActionsListItem: rowActionsListItemProps, ...menuComponentsProps } = componentsProps;

    return (
        <>
            {showMenuButtonAsIconButton ? (
                <RowActionsIconItem onClick={openMenu} icon={icon} tooltip={text} ref={menuIconItemButtonRef} {...rowActionsIconItemProps} />
            ) : (
                <RowActionsListItem
                    onClick={openMenu}
                    icon={icon}
                    textSecondary={textSecondary}
                    endIcon={endIcon}
                    ref={menuListItemButtonRef}
                    {...rowActionsListItemProps}
                >
                    {text}
                </RowActionsListItem>
            )}
            <Menu
                anchorEl={showMenuButtonAsIconButton ? menuIconItemButtonRef.current : menuListItemButtonRef.current}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "center", horizontal: "left" }}
                {...menuComponentsProps}
                {...restMenuProps}
                open={menuIsOpen}
                onClose={closeMenu}
            />
        </>
    );
};
