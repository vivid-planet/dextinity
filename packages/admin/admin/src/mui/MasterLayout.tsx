import { type ComponentsOverrides, CssBaseline } from "@mui/material";
import { css, type Theme, useThemeProps } from "@mui/material/styles";
import { type ComponentType, type CSSProperties, type ReactNode, useEffect, useState } from "react";

import { AppHeader } from "../appHeader/AppHeader";
import { AppHeaderMenuButton } from "../appHeader/menuButton/AppHeaderMenuButton";
import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";
import { useStoredState } from "../hooks/useStoredState";
import { MainNavigationContext } from "./mainNavigation/Context";
import { MasterLayoutContext } from "./MasterLayoutContext";

export type MasterLayoutClassKey = "root" | "header" | "menuWrapper" | "contentWrapper" | "sidePanel";

const Root = createComponentSlot("div")<MasterLayoutClassKey>({
    componentName: "MasterLayout",
    slotName: "root",
})(css`
    display: flex;
    flex-wrap: nowrap;
`);

const Header = createComponentSlot("div")<MasterLayoutClassKey>({
    componentName: "MasterLayout",
    slotName: "header",
})(
    ({ theme }) => css`
        z-index: ${theme.zIndex.drawer - 10};
    `,
);

const MenuWrapper = createComponentSlot("div")<MasterLayoutClassKey>({
    componentName: "MasterLayout",
    slotName: "menuWrapper",
})();

const ContentWrapper = createComponentSlot("div")<MasterLayoutClassKey>({
    componentName: "MasterLayout",
    slotName: "contentWrapper",
})(css`
    flex-grow: 1;
    padding-top: var(--dextinity-admin-master-layout-content-top-spacing);
    width: calc(100% - var(--dextinity-admin-master-layout-menu-width) - var(--dextinity-admin-master-layout-side-panel-width));
`);

const SidePanel = createComponentSlot("div")<MasterLayoutClassKey>({
    componentName: "MasterLayout",
    slotName: "sidePanel",
})(css`
    flex-shrink: 0;
    padding-top: var(--dextinity-admin-master-layout-content-top-spacing);
`);

export interface MasterLayoutProps extends ThemedComponentBaseProps<{
    root: "div";
    header: "div";
    menuWrapper: "div";
    contentWrapper: "div";
    sidePanel: "div";
}> {
    children: ReactNode;
    menuComponent: ComponentType;
    /**
     * Rendered next to the content, e.g. a help or a comments panel. The content is narrowed by the width of the side panel,
     * so a side panel that animates its width resizes the content with it. A side panel that overlays the content,
     * e.g. with `position: fixed`, takes no width and leaves the content as it is.
     */
    sidePanelComponent?: ComponentType;
    headerComponent?: ComponentType;
    openMenuByDefault?: boolean;
    /**
     * Defines the global header-height. The value defined here will also be used by AppHeader and Toolbar.
     */
    headerHeight?: number;
}

export function MasterLayout(inProps: MasterLayoutProps) {
    const {
        children,
        menuComponent: Menu,
        sidePanelComponent: SidePanelComponent,
        headerComponent: HeaderComponent,
        openMenuByDefault = true,
        headerHeight = 60,
        slotProps,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminMasterLayout" });

    const [open, setOpen] = useStoredState("main-navigation-open", openMenuByDefault);
    const [drawerVariant, setDrawerVariant] = useState<"permanent" | "temporary">("permanent");
    const [hasMultipleMenuItems, setHasMultipleMenuItems] = useState(true);
    const [menuRef, menuWidth] = useElementWidth();
    const [sidePanelRef, sidePanelWidth] = useElementWidth();

    const toggleOpen = () => {
        setOpen(!open);
    };

    return (
        <MainNavigationContext.Provider
            value={{ open, toggleOpen, setOpen, drawerVariant, setDrawerVariant, hasMultipleMenuItems, setHasMultipleMenuItems }}
        >
            <MasterLayoutContext.Provider value={{ headerHeight }}>
                <CssBaseline />
                <Root {...slotProps?.root} {...restProps}>
                    <Header {...slotProps?.header}>
                        {HeaderComponent ? (
                            <HeaderComponent />
                        ) : (
                            <AppHeader>
                                <AppHeaderMenuButton onClick={toggleOpen} />
                            </AppHeader>
                        )}
                    </Header>
                    <MenuWrapper {...slotProps?.menuWrapper} ref={menuRef}>
                        <Menu />
                    </MenuWrapper>
                    <ContentWrapper
                        {...slotProps?.contentWrapper}
                        style={
                            {
                                "--dextinity-admin-master-layout-content-top-spacing": `${headerHeight}px`,
                                "--dextinity-admin-master-layout-menu-width": `${menuWidth}px`,
                                "--dextinity-admin-master-layout-side-panel-width": `${sidePanelWidth}px`,
                            } as CSSProperties
                        }
                    >
                        {children}
                    </ContentWrapper>
                    {SidePanelComponent && (
                        <SidePanel
                            {...slotProps?.sidePanel}
                            ref={sidePanelRef}
                            style={
                                {
                                    ...slotProps?.sidePanel?.style,
                                    "--dextinity-admin-master-layout-content-top-spacing": `${headerHeight}px`,
                                } as CSSProperties
                            }
                        >
                            <SidePanelComponent />
                        </SidePanel>
                    )}
                </Root>
            </MasterLayoutContext.Provider>
        </MainNavigationContext.Provider>
    );
}

function useElementWidth() {
    const [element, setElement] = useState<HTMLDivElement | null>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (!element) {
            return;
        }

        const resizeObserver = new ResizeObserver(([entry]) => {
            if (entry) {
                setWidth(entry.contentRect.width);
            }
        });

        resizeObserver.observe(element);

        return () => {
            resizeObserver.disconnect();
        };
    }, [element]);

    return [setElement, element ? width : 0] as const;
}

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminMasterLayout: MasterLayoutClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminMasterLayout: MasterLayoutProps;
    }

    interface Components {
        DextinityAdminMasterLayout?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminMasterLayout"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminMasterLayout"];
        };
    }
}
