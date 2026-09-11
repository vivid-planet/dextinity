import { type ComponentsOverrides, Paper, Toolbar as MuiToolbar } from "@mui/material";
import { css, type Theme, useThemeProps } from "@mui/material/styles";
import { type ReactNode, useContext } from "react";

import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import { MasterLayoutContext } from "../../mui/MasterLayoutContext";
import { FillSpace } from "../FillSpace";
import { ToolbarBreadcrumbs } from "./ToolbarBreadcrumbs";

export type ToolbarClassKey = "root" | "topBar" | "bottomBar" | "mainContentContainer" | "breadcrumbs" | "scopeIndicator" | "topBarActions";

export interface ToolbarProps
    extends ThemedComponentBaseProps<{
        root: typeof Paper;
        bottomBar: typeof MuiToolbar;
        mainContentContainer: "div";
        topBar: "div";
        breadcrumbs: typeof ToolbarBreadcrumbs;
        scopeIndicator: "div";
        topBarActions: "div";
    }> {
    elevation?: number;
    children?: ReactNode;
    scopeIndicator?: ReactNode;
    topBarActions?: ReactNode;
    hideTopBar?: boolean;
    /**
     * The height of the header above the toolbar. Default behaviour is to use the height of the headerHeight from the
     * MasterLayoutContext, but can be overriden here
     */
    headerHeight?: number;
}
type OwnerState = {
    headerHeight: number;
};

const Root = createComponentSlot(Paper)<ToolbarClassKey, OwnerState>({
    componentName: "Toolbar",
    slotName: "root",
})(
    ({ ownerState }) => css`
        position: sticky;
        z-index: 10;
        display: flex;
        flex-direction: column;
        justify-content: center;
        top: ${ownerState.headerHeight}px;
        padding: 0;
    `,
);

const TopBar = createComponentSlot("div")<ToolbarClassKey>({
    componentName: "Toolbar",
    slotName: "topBar",
})(
    ({ theme }) => css`
        min-height: 40px;
        display: flex;
        align-items: center;
        gap: ${theme.spacing(2)};
        padding-left: ${theme.spacing(2)};
        padding-right: ${theme.spacing(2)};

        ${theme.breakpoints.up("sm")} {
            padding-left: ${theme.spacing(2)};
            padding-right: ${theme.spacing(2)};
        }

        ${theme.breakpoints.up("md")} {
            padding-left: ${theme.spacing(4)};
            padding-right: ${theme.spacing(4)};
        }
    `,
);

const TopBarActions = createComponentSlot("div")<ToolbarClassKey>({
    componentName: "Toolbar",
    slotName: "topBarActions",
})();

const ScopeIndicator = createComponentSlot("div")<ToolbarClassKey>({
    componentName: "Toolbar",
    slotName: "scopeIndicator",
})();

const BottomBar = createComponentSlot(MuiToolbar)<ToolbarClassKey>({
    componentName: "Toolbar",
    slotName: "bottomBar",
})(
    ({ theme }) => css`
        display: flex;
        flex: 1;
        align-items: stretch;
        border-top: solid 1px ${theme.palette.grey["50"]};
        box-sizing: border-box;
        min-height: 60px;
        padding-left: ${theme.spacing(2)};
        padding-right: ${theme.spacing(2)};

        ${theme.breakpoints.up("sm")} {
            min-height: 60px;
            padding-left: ${theme.spacing(2)};
            padding-right: ${theme.spacing(2)};
        }

        ${theme.breakpoints.up("md")} {
            padding-left: ${theme.spacing(4)};
            padding-right: ${theme.spacing(4)};
        }

        // necessary to override strange MUI default styling
        @media (min-width: 0px) and (orientation: landscape) {
            min-height: 60px;
        }
    `,
);

const MainContentContainer = createComponentSlot("div")<ToolbarClassKey>({
    componentName: "Toolbar",
    slotName: "mainContentContainer",
})(css`
    display: flex;
    flex: 1;
`);

const Breadcrumbs = createComponentSlot(ToolbarBreadcrumbs)<ToolbarClassKey>({
    componentName: "Toolbar",
    slotName: "breadcrumbs",
})();

export const Toolbar = (inProps: ToolbarProps) => {
    const {
        children,
        hideTopBar = false,
        elevation = 1,
        slotProps,
        scopeIndicator,
        topBarActions,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminToolbar" });
    const { headerHeight } = useContext(MasterLayoutContext);

    const ownerState: OwnerState = {
        headerHeight: inProps.headerHeight ?? headerHeight,
    };
    return (
        <Root elevation={elevation} ownerState={ownerState} {...slotProps?.root} {...restProps}>
            {!hideTopBar && (
                <TopBar {...slotProps?.topBar}>
                    {Boolean(scopeIndicator) && <ScopeIndicator {...slotProps?.scopeIndicator}>{scopeIndicator}</ScopeIndicator>}
                    <Breadcrumbs {...slotProps?.breadcrumbs} />
                    <FillSpace />
                    {Boolean(topBarActions) && <TopBarActions {...slotProps?.topBarActions}>{topBarActions}</TopBarActions>}
                </TopBar>
            )}
            {children && (
                <BottomBar {...slotProps?.bottomBar}>
                    <MainContentContainer {...slotProps?.mainContentContainer}>{children}</MainContentContainer>
                </BottomBar>
            )}
        </Root>
    );
};

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminToolbar: ToolbarClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminToolbar: ToolbarProps;
    }

    interface Components {
        DextinityAdminToolbar?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminToolbar"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminToolbar"];
        };
    }
}
