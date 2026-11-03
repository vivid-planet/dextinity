import { css, Drawer as MuiDrawer, drawerClasses, type DrawerProps, type Theme } from "@mui/material";

import { createComponentSlot } from "../../helpers/createComponentSlot";
import { DEFAULT_DRAWER_WIDTH, DEFAULT_DRAWER_WIDTH_COLLAPSED } from "./MainNavigation";

const getOpenedAnimation = (theme: Theme, drawerVariant: DrawerProps["variant"], drawerWidth: number = DEFAULT_DRAWER_WIDTH) => css`
    width: ${drawerVariant === "temporary" ? "100%" : `${drawerWidth}px`};
    transition: width ${theme.transitions.easing.sharp} ${theme.transitions.duration.enteringScreen}ms;
`;

const getClosedAnimation = (
    theme: Theme,
    drawerVariant: DrawerProps["variant"],
    drawerWidth: number = DEFAULT_DRAWER_WIDTH,
    drawerWidthCollapsed: number = DEFAULT_DRAWER_WIDTH_COLLAPSED,
) => css`
    width: ${drawerVariant === "temporary" ? "100%" : `${drawerWidthCollapsed}px`};
    transition: width ${theme.transitions.easing.sharp} ${theme.transitions.duration.leavingScreen}ms;
`;

export type MainNavigationClassKey = "drawer" | "permanent" | "temporary" | "open" | "closed";

export type OwnerState = {
    drawerWidth: number;
    drawerWidthCollapsed: number;
    open: boolean;
    headerHeight: number;
};

const getSharedStyles = (theme: Theme, headerHeight: number) => css`
    background-color: ${theme.palette.common.white};
    overflow-x: hidden;
    height: calc(100% - ${headerHeight}px);
    top: ${headerHeight}px;

    .DextinityAdminMainNavigationItemGroup-root + .DextinityAdminMainNavigationItem-root {
        margin-top: ${theme.spacing(8)};
    }
`;

export const TemporaryDrawer = createComponentSlot(MuiDrawer)<MainNavigationClassKey, OwnerState>({
    componentName: "MainNavigation",
    slotName: "temporary",
    classesResolver(ownerState) {
        return ["drawer", ownerState.open ? "open" : "closed"];
    },
})(
    ({ theme, ownerState }) => css`
        height: calc(100% - ${ownerState.headerHeight}px);
        top: ${ownerState.headerHeight}px;

        ${drawerClasses.root} {
            top: ${ownerState.headerHeight}px;
        }

        .${drawerClasses.paper} {
            ${getSharedStyles(theme, ownerState.headerHeight)}
            ${
                ownerState.open
                    ? getOpenedAnimation(theme, "temporary", ownerState.drawerWidth)
                    : getClosedAnimation(theme, "temporary", ownerState.drawerWidth)
            }
        }

        .${drawerClasses.paperAnchorLeft} {
            border-right: none;
        }
    `,
);

export const PermanentDrawer = createComponentSlot(MuiDrawer)<MainNavigationClassKey, OwnerState>({
    componentName: "MainNavigation",
    slotName: "permanent",
    classesResolver(ownerState) {
        return ["drawer", ownerState.open ? "open" : "closed"];
    },
})(
    ({ theme, ownerState }) => css`
        ${getSharedStyles(theme, ownerState.headerHeight)}
        flex-shrink: 0;
        white-space: nowrap;
        box-sizing: border-box;
        ${
            ownerState.open
                ? getOpenedAnimation(theme, "permanent", ownerState.drawerWidth)
                : getClosedAnimation(theme, "permanent", ownerState.drawerWidthCollapsed)
        }

        .${drawerClasses.paper} {
            ${getSharedStyles(theme, ownerState.headerHeight)}
            height: calc(100% - ${ownerState.headerHeight}px);
            ${
                ownerState.open
                    ? getOpenedAnimation(theme, "permanent", ownerState.drawerWidth)
                    : getClosedAnimation(theme, "permanent", ownerState.drawerWidthCollapsed)
            }
        }

        .${drawerClasses.paperAnchorLeft} {
            border-right: none;
        }
    `,
);
