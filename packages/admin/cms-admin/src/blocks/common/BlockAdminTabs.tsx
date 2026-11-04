import { RouteWithErrorBoundary } from "@dextinity/admin";
import { Tab as MuiTab, type TabProps, Tabs as MuiTabs } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { JSX } from "react";
import { Switch, useRouteMatch } from "react-router";
import { Link, type LinkProps } from "react-router-dom";

import type { BlockAdminComponentPart } from "../types";
import { TabContent } from "./AdminTabsTabContent";

export interface BlockAdminTabsProps {
    children: BlockAdminComponentPart[];
}

export function BlockAdminTabs({ children }: BlockAdminTabsProps): JSX.Element | null {
    const match = useRouteMatch();
    const tabRouteMatch = useRouteMatch<{ tab: string }>(`${match.path}/:tab`);
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
                    const url = index === 0 ? match.url : `${match.url}/${tab.key}`;
                    return <Tab key={tab.key} value={tab.key} label={tab.label} component={Link} to={url} />;
                })}
            </Tabs>
            <TabContent selectedTab={selectedTab}>
                <Switch>
                    {otherTabs.map((tab) => (
                        <RouteWithErrorBoundary key={tab.key} path={`${match.url}/${tab.key}`}>
                            {tab.content}
                        </RouteWithErrorBoundary>
                    ))}

                    {/* first tab is default route, last in <Switch> */}
                    <RouteWithErrorBoundary path={match.url}>{firstTab.content}</RouteWithErrorBoundary>
                </Switch>
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
