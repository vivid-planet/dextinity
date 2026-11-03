import { type ComponentsOverrides, Tab as MuiTab, type TabProps as MuiTabProps, Tabs, type TabsProps } from "@mui/material";
import { css, type Theme, useThemeProps } from "@mui/material/styles";
import { Children, type ComponentType, isValidElement, type ReactElement, type ReactNode, type SyntheticEvent } from "react";
import { useLocation } from "react-router";

import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";
import { matchAbsolutePath, RouteMatchProvider, useCurrentRouteMatch } from "../router/internal/routeContext";
import { useStableNavigate } from "../router/internal/useStableNavigate";
import { useSubRoutePrefix } from "../router/SubRoute";
import { useIsActiveStackSwitch } from "../stack/useIsActiveStackSwitch";
import { TabScrollButton } from "./TabScrollButton";

export type RouterTabsClassKey = "root" | "tabs" | "content" | "contentHidden";

type OwnerState = { contentHidden?: boolean };

const Root = createComponentSlot("div")<RouterTabsClassKey>({
    componentName: "RouterTabs",
    slotName: "root",
})();

const StyledTabs = createComponentSlot(Tabs)<RouterTabsClassKey>({
    componentName: "RouterTabs",
    slotName: "tabs",
})();

const Content = createComponentSlot("div")<RouterTabsClassKey, OwnerState>({
    componentName: "RouterTabs",
    slotName: "content",
    classesResolver(ownerState) {
        return [ownerState.contentHidden && "contentHidden"];
    },
})(
    ({ ownerState }) => css`
        ${
            ownerState.contentHidden &&
            css`
                display: none;
            `
        }
    `,
);

function deduplicateSlashesInUrl(url: string) {
    return url.replace(/\/+/g, "/");
}

interface TabProps extends Omit<MuiTabProps, "children"> {
    path: string;
    label: ReactNode;
    forceRender?: boolean;
    children: ReactNode;
}

export const RouterTab = (props: TabProps) => null;

type RouterTabsChild = ReactElement<TabProps> | boolean | null | undefined;
type RouterTabsChildren = RouterTabsChild | Array<RouterTabsChild | Array<RouterTabsChild>>;

interface Props extends ThemedComponentBaseProps<{
    root: "div";
    tabs: typeof Tabs;
    content: "div";
}> {
    children: RouterTabsChildren;
    tabComponent?: ComponentType<MuiTabProps>;
    tabsProps?: Partial<TabsProps>;
}

export function RouterTabs(inProps: Props) {
    const {
        children,
        tabComponent: TabComponent = MuiTab,
        tabsProps: { slots: tabsSlots, ...tabsProps } = {},
        slotProps,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminRouterTabs" });

    const navigate = useStableNavigate();
    const { pathname } = useLocation();
    const subRoutePrefix = useSubRoutePrefix();
    const routeMatch = useCurrentRouteMatch();
    const isActiveStackSwitch = useIsActiveStackSwitch();

    const childrenArr = Children.toArray(children);

    const handleChange = (event: SyntheticEvent, value: number) => {
        const paths = childrenArr.map((child) => {
            return isValidElement<TabProps>(child) ? child.props.path : null;
        });
        navigate(deduplicateSlashesInUrl(subRoutePrefix + paths[value]) || "/");
    };

    const paths = childrenArr.map((child) => {
        // as seen in https://github.com/mui-org/material-ui/blob/v4.11.0/packages/material-ui/src/Tabs/Tabs.js#L390
        if (!isValidElement<TabProps>(child)) {
            return null;
        }

        if (child.type !== RouterTab) {
            throw new Error("RouterTabs must contain only Tab children");
        }
        return child.props.path;
    });

    const rearrangedChildren = Children.toArray(children);
    const defaultPathIndex = paths.indexOf("");

    if (defaultPathIndex >= 0) {
        const defaultPathChild = rearrangedChildren[defaultPathIndex];

        rearrangedChildren.splice(defaultPathIndex, 1);
        rearrangedChildren.push(defaultPathChild);
    }

    const tabMatch = matchAbsolutePath(deduplicateSlashesInUrl(`${subRoutePrefix}/:tab`), pathname, { end: false });
    const tabPath = tabMatch ? `/${tabMatch.params.tab}` : "";

    // used for only rendering the first matching child
    // note: React Router's Routes can't be used because it
    // prevents the rendering of more than one child
    // however we need to render all children if forceRender is true
    let foundFirstMatch = false;

    return (
        <Root {...slotProps?.root} {...restProps}>
            {/* When inside a Stack show only the last TabBar */}
            {isActiveStackSwitch && (
                <RouteMatchProvider match={tabMatch}>
                    <StyledTabs
                        value={paths.includes(tabPath) ? paths.indexOf(tabPath) : defaultPathIndex}
                        onChange={handleChange}
                        slots={{ scrollButtons: TabScrollButton, ...tabsSlots }}
                        scrollButtons="auto"
                        variant="scrollable"
                        {...slotProps?.tabs}
                        {...tabsProps}
                    >
                        {Children.map(children, (child) => {
                            if (!isValidElement<TabProps>(child)) {
                                return null;
                            }
                            const { path, forceRender, children, label, ...restTabProps } = child.props;
                            return <TabComponent label={label} {...restTabProps} />;
                        })}
                    </StyledTabs>
                </RouteMatchProvider>
            )}
            {Children.map(rearrangedChildren, (child) => {
                if (!isValidElement<TabProps>(child)) {
                    return null;
                }
                const isDefaultTab = child.props.path === "";
                // The default tab matches whenever its parent route does, so it keeps the parent's route context
                const match = isDefaultTab
                    ? null
                    : matchAbsolutePath(deduplicateSlashesInUrl(`${subRoutePrefix}/${child.props.path}`), pathname, { end: false });
                const isMatching = isDefaultTab ? routeMatch !== null : match !== null;

                let content: ReactNode = null;
                if (isMatching && !foundFirstMatch) {
                    foundFirstMatch = true;
                    content = (
                        <Content ownerState={{ contentHidden: false }} {...slotProps?.content}>
                            {child.props.children}
                        </Content>
                    );
                } else if (child.props.forceRender) {
                    content = (
                        <Content ownerState={{ contentHidden: true }} {...slotProps?.content}>
                            {child.props.children}
                        </Content>
                    );
                }

                return isDefaultTab ? content : <RouteMatchProvider match={match}>{content}</RouteMatchProvider>;
            })}
        </Root>
    );
}

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminRouterTabs: RouterTabsClassKey;
    }

    interface Components {
        DextinityAdminRouterTabs?: {
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminRouterTabs"];
        };
    }
}
