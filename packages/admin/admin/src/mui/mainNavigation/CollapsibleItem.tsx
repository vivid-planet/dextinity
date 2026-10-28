import { ChevronDown, ChevronRight, ChevronUp } from "@dextinity/admin-icons";
import { Collapse, type ComponentsOverrides, Fade, List, Menu, type Theme, type Typography, useThemeProps } from "@mui/material";
import { Children, cloneElement, type MouseEvent, type ReactElement, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { matchPath, useLocation } from "react-router";

import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import {
    CollapsibleIndicator,
    CollapsibleItemMainNavigationItem,
    ItemTitle,
    type MainNavigationCollapsibleItemClassKey,
    type OwnerState,
    Root,
} from "./CollapsibleItem.styles";
import { useMainNavigation } from "./Context";
import type { MainNavigationItem, MainNavigationItemLevel, MainNavigationItemProps } from "./Item";
import type { MainNavigationItemRouterLinkProps } from "./ItemRouterLink";

export type MainNavigationChild = ReactElement<MainNavigationCollapsibleItemProps | MainNavigationItemRouterLinkProps | MainNavigationItemProps>;

export interface MainNavigationCollapsibleItemProps
    extends
        Omit<MainNavigationItemProps, "slotProps">,
        ThemedComponentBaseProps<{
            root: "div";
            mainNavigationItem: typeof MainNavigationItem;
            itemTitle: typeof Typography;
            collapsibleIndicator: "div";
        }> {
    children: MainNavigationChild | MainNavigationChild[];
    openByDefault?: boolean;
    isMenuOpen?: boolean;
    iconMapping?: {
        openDropdown?: ReactNode;
        closeDropdown?: ReactNode;
        firstLevelHoverIndicator?: ReactNode;
        secondLevelHoverIndicator?: ReactNode;
    };
}

export const MainNavigationCollapsibleItem = (inProps: MainNavigationCollapsibleItemProps) => {
    const {
        classes,
        level = 1,
        primary,
        secondary,
        isMenuOpen,
        icon,
        openByDefault,
        children,
        slotProps,
        iconMapping,
        ...restProps
    } = useThemeProps({
        props: inProps,
        name: "DextinityAdminMainNavigationCollapsibleItem",
    });

    const {
        openDropdown: openDropdownIcon = <ChevronDown color="inherit" fontSize="inherit" />,
        closeDropdown: closeDropdownIcon = <ChevronUp color="inherit" fontSize="inherit" />,
        firstLevelHoverIndicator: firstLevelHoverIndicatorIcon = <ChevronRight color="inherit" fontSize="inherit" />,
        secondLevelHoverIndicator: secondLevelHoverIndicatorIcon = <ChevronRight color="inherit" fontSize="inherit" />,
    } = iconMapping ?? {};

    const { drawerVariant } = useMainNavigation();
    const itemLevel: MainNavigationItemLevel = level ?? 1;
    const hasSelectedChild = useRef(false);

    const location = useLocation();

    const [isSubmenuOpen, setIsSubmenuOpen] = useState<boolean>(openByDefault || hasSelectedChild.current);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // set open state manually to false to avoid a menu opening when isMenuOpen state changes
        if (!isMenuOpen) {
            setIsSubmenuOpen(false);
        }
    }, [isMenuOpen]);

    const childElements = useMemo(() => {
        function checkIfPathInLocation(
            child: ReactElement<MainNavigationCollapsibleItemProps | MainNavigationItemRouterLinkProps | MainNavigationItemProps>,
        ) {
            return "to" in child.props && matchPath(location.pathname, { path: child.props.to, strict: true });
        }
        hasSelectedChild.current = false;

        return Children.map(children, (child: MainNavigationChild) => {
            // child is selected
            if (checkIfPathInLocation(child)) {
                hasSelectedChild.current = true;
                setIsSubmenuOpen(true);
            }

            // sub child is selected
            const subChildElements =
                "children" in child.props
                    ? Children.map(child?.props?.children, (child: MainNavigationChild) => child)
                    : ([] as MainNavigationChild[]);
            if (subChildElements?.some((child: MainNavigationChild) => child.props && checkIfPathInLocation(child))) {
                hasSelectedChild.current = true;
                setIsSubmenuOpen(true);
            }

            const newItemLevel = itemLevel + 1;

            return cloneElement<MainNavigationCollapsibleItemProps | MainNavigationItemRouterLinkProps | MainNavigationItemProps>(child, {
                level: newItemLevel === 1 || newItemLevel === 2 || newItemLevel === 3 ? newItemLevel : undefined,
                isMenuOpen,
            });
        });
    }, [children, isMenuOpen, itemLevel, location.pathname]);

    const closeMenu = () => {
        setAnchorEl(null);
        setIsSubmenuOpen(false);
    };

    const handlePopoverOpen = (event: MouseEvent<HTMLElement>) => {
        if (isMenuOpen) {
            return;
        }
        if (anchorEl !== event.currentTarget) {
            setAnchorEl(event.currentTarget);
            setIsSubmenuOpen(true);
        }
    };

    const handlePopoverClose = (e: MouseEvent<HTMLElement>) => {
        if (isMenuOpen) {
            return;
        }
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const { clientX, clientY } = e;

        if (childElements?.length && clientX + 2 > rect.right && clientY > rect.top && clientY < rect.bottom) {
            return;
        }

        closeMenu();
    };

    let itemId,
        mouseOverMenuId = undefined;
    if (typeof primary === "string") {
        itemId = `menu-item-${primary?.replace(/\s/g, "-").toLowerCase()}`;
        mouseOverMenuId = `item-hover-menu-${primary?.replace(/\s/g, "-").toLowerCase()}`;
    }

    const ownerState: OwnerState = {
        childSelected: hasSelectedChild.current,
        open: isSubmenuOpen,
        menuOpen: Boolean(isMenuOpen),
        subMenuOpen: Boolean(isSubmenuOpen),
        level: itemLevel,
        variant: drawerVariant,
    };

    let collapsibleIndicatorIcon: ReactNode = null;

    if (isMenuOpen) {
        if (isSubmenuOpen) {
            collapsibleIndicatorIcon = closeDropdownIcon;
        } else {
            collapsibleIndicatorIcon = openDropdownIcon;
        }
    } else {
        if (level === 1) {
            collapsibleIndicatorIcon = firstLevelHoverIndicatorIcon;
        } else if (level === 2) {
            collapsibleIndicatorIcon = secondLevelHoverIndicatorIcon;
        }
    }

    return (
        <Root {...slotProps?.root} {...restProps} ownerState={ownerState}>
            <CollapsibleItemMainNavigationItem
                id={itemId}
                aria-haspopup="true"
                aria-controls={isSubmenuOpen ? mouseOverMenuId : undefined}
                aria-expanded={isSubmenuOpen ? "true" : undefined}
                onMouseOver={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
                primary={primary}
                secondary={secondary}
                hasSubitems={!!childElements?.length}
                isCollapsibleOpen={isSubmenuOpen}
                isMenuOpen={isMenuOpen}
                icon={icon}
                level={level}
                onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
                secondaryAction={<CollapsibleIndicator ownerState={ownerState}>{collapsibleIndicatorIcon}</CollapsibleIndicator>}
                ownerState={ownerState}
                {...slotProps?.mainNavigationItem}
            />
            {!isMenuOpen && drawerVariant === "permanent" ? (
                <Menu
                    id={mouseOverMenuId}
                    MenuListProps={{
                        "aria-labelledby": itemId,
                        onMouseLeave: closeMenu,
                        style: { pointerEvents: "auto", paddingBottom: itemLevel == 1 ? 10 : undefined },
                        disablePadding: itemLevel !== 2,
                    }}
                    sx={{
                        pointerEvents: "none",
                    }}
                    open={isSubmenuOpen && anchorEl !== null}
                    anchorEl={anchorEl}
                    TransitionComponent={Fade}
                    anchorOrigin={{
                        vertical: "center",
                        horizontal: "right",
                    }}
                    transformOrigin={{
                        vertical: "center",
                        horizontal: "left",
                    }}
                    onClose={handlePopoverClose}
                >
                    {itemLevel === 1 && <ItemTitle>{primary}</ItemTitle>}
                    {childElements}
                </Menu>
            ) : (
                <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
                    <List disablePadding>{childElements}</List>
                </Collapse>
            )}
        </Root>
    );
};

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminMainNavigationCollapsibleItem: MainNavigationCollapsibleItemClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminMainNavigationCollapsibleItem: MainNavigationCollapsibleItemProps;
    }

    interface Components {
        DextinityAdminMainNavigationCollapsibleItem?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminMainNavigationCollapsibleItem"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminMainNavigationCollapsibleItem"];
        };
    }
}
