import { RouteWithErrorBoundary, useCurrentRouteMatch } from "@dextinity/admin";
import { Tab as MuiTab, type TabProps, Tabs as MuiTabs } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { JSX } from "react";
import { Link, type LinkProps, Route, Routes, useLocation } from "react-router";

import { decodePathSegment, getPathnameBelowUrl } from "../../common/getPathnameBelowUrl";
import type { BlockAdminComponentPart } from "../types";
import { TabContent } from "./AdminTabsTabContent";

export interface BlockAdminTabsProps {
    children: BlockAdminComponentPart[];
}

export function BlockAdminTabs({ children }: BlockAdminTabsProps): JSX.Element | null {
    const routeUrl = useCurrentRouteMatch()?.url ?? "";
    const { pathname } = useLocation();
    const pathnameBelowRoute = getPathnameBelowUrl(pathname, routeUrl);
    const selected = pathnameBelowRoute ? decodePathSegment(pathnameBelowRoute.split("/")[1]) : undefined;
    if (children.length < 1) {
        return null;
    }
    const [firstTab, ...otherTabs] = children;
    const selectedTab = children.find((tab) => tab.key === selected) ? selected : firstTab.key; //fall back to first, as <Routes> does
    return (
        <Root key="tabs">
            <Tabs value={selectedTab} variant="scrollable" scrollButtons="auto">
                {children.map((tab, index) => {
                    const url = index === 0 ? routeUrl : `${routeUrl}/${tab.key}`;
                    return <Tab key={tab.key} value={tab.key} label={tab.label} component={Link} to={url} />;
                })}
            </Tabs>
            <TabContent selectedTab={selectedTab}>
                {/* The keys reset a tab when navigating to the tabs of another URL, e.g. of another block */}
                <Routes>
                    {otherTabs.map((tab) => (
                        <Route
                            key={tab.key}
                            path={`${tab.key}/*`}
                            element={<RouteWithErrorBoundary key={`${routeUrl}/${tab.key}`}>{tab.content}</RouteWithErrorBoundary>}
                        />
                    ))}

                    {/* first tab is default route, ranked last by <Routes> */}
                    <Route path="*" element={<RouteWithErrorBoundary key={routeUrl}>{firstTab.content}</RouteWithErrorBoundary>} />
                </Routes>
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
