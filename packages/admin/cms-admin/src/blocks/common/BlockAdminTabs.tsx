import { AbsoluteRoute, AbsoluteRoutes, ErrorBoundary, useCurrentRouteMatch } from "@dextinity/admin";
import { Tab as MuiTab, type TabProps, Tabs as MuiTabs } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { JSX } from "react";
import { Link, type LinkProps, matchPath, useLocation } from "react-router";

import type { BlockAdminComponentPart } from "../types";
import { TabContent } from "./AdminTabsTabContent";

export interface BlockAdminTabsProps {
    children: BlockAdminComponentPart[];
}

export function BlockAdminTabs({ children }: BlockAdminTabsProps): JSX.Element | null {
    const match = useCurrentRouteMatch();
    const matchUrl = match.url.replace(/\/$/, "");
    const location = useLocation();
    const tabRouteMatch = matchPath({ path: `${matchUrl}/:tab`, end: false }, location.pathname);
    const selected = tabRouteMatch?.params.tab;
    if (children.length < 1) {
        return null;
    }
    const [firstTab, ...otherTabs] = children;
    const selectedTab = children.find((tab) => tab.key === selected) ? selected : firstTab.key; //fall back to first, as <Switch> does
    return (
        <Root key="tabs">
            <Tabs value={selectedTab} variant="scrollable" scrollButtons="auto">
                {children.map((tab, index) => {
                    const url = index === 0 ? match.url : `${matchUrl}/${tab.key}`;
                    return <Tab key={tab.key} value={tab.key} label={tab.label} component={Link} to={url} />;
                })}
            </Tabs>
            <TabContent selectedTab={selectedTab}>
                <AbsoluteRoutes>
                    {otherTabs.map((tab) => (
                        <AbsoluteRoute key={tab.key} path={`${matchUrl}/${tab.key}`}>
                            <ErrorBoundary>{tab.content}</ErrorBoundary>
                        </AbsoluteRoute>
                    ))}

                    {/* first tab is default route, last in <AbsoluteRoutes> */}
                    <AbsoluteRoute path={match.url}>
                        <ErrorBoundary>{firstTab.content}</ErrorBoundary>
                    </AbsoluteRoute>
                </AbsoluteRoutes>
            </TabContent>
        </Root>
    );
}

const Root = styled("div")`
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const Tabs = styled(MuiTabs)`
    background-color: ${({ theme }) => theme.palette.background.default};
    flex-shrink: 0;
    margin-bottom: 0;
`;

const Tab = styled(MuiTab)<TabProps & LinkProps>`
    min-width: 0;
`;
