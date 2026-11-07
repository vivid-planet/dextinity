import { Tabs } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import type { JSX } from "react";
import { useIntl } from "react-intl";
import { Switch, useRouteMatch } from "react-router";

import { RouteWithContentErrorBoundary } from "../../common/errorBoundary/RouteWithContentErrorBoundary";
import { RouterTabLink } from "../../common/RouterTabLink";
import type { BlockAdminComponentPart } from "../types";
import { TabContent } from "./AdminTabsTabContent";

export interface BlockAdminTabsProps {
    children: BlockAdminComponentPart[];
}

/**
 * The parts of a block's admin component as tabs, each a route.
 *
 * @deprecated Pass the parts as `tabs` to `PageContentEditor`, or use `Tabs` of `@dextinity/ui`.
 */
export function BlockAdminTabs({ children }: BlockAdminTabsProps): JSX.Element | null {
    const intl = useIntl();
    const match = useRouteMatch();
    const tabRouteMatch = useRouteMatch<{ tab: string }>(`${match.path}/:tab`);
    const selected = tabRouteMatch?.params.tab;
    if (children.length < 1) {
        return null;
    }
    const [firstTab, ...otherTabs] = children;
    const selectedTab = children.find((tab) => tab.key === selected) ? (selected as string) : firstTab.key; //fall back to first, as <Switch> does
    return (
        <Root key="tabs">
            <TabBar
                aria-label={intl.formatMessage({ id: "dextinity.blocks.adminTabs", defaultMessage: "Sections" })}
                value={selectedTab}
                onChange={() => {
                    // The tabs are router links, the route decides the selected tab
                }}
                items={children.map((tab, index) => ({
                    value: tab.key,
                    label: tab.label,
                    href: index === 0 ? match.url : `${match.url}/${tab.key}`,
                }))}
                slots={{ tab: RouterTabLink }}
            />
            <TabContent selectedTab={selectedTab}>
                <Switch>
                    {otherTabs.map((tab) => (
                        <RouteWithContentErrorBoundary key={tab.key} path={`${match.url}/${tab.key}`}>
                            {tab.content}
                        </RouteWithContentErrorBoundary>
                    ))}

                    {/* first tab is default route, last in <Switch> */}
                    <RouteWithContentErrorBoundary path={match.url}>{firstTab.content}</RouteWithContentErrorBoundary>
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

const TabBar = styled(Tabs)`
    flex-shrink: 0;
`;
