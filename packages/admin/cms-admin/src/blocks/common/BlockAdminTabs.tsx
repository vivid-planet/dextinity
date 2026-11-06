import { RouteWithErrorBoundary } from "@dextinity/admin";
import { Tabs } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { type AnchorHTMLAttributes, forwardRef, type JSX } from "react";
import { useIntl } from "react-intl";
import { Switch, useRouteMatch } from "react-router";
import { Link } from "react-router-dom";

import type { BlockAdminComponentPart } from "../types";
import { TabContent } from "./AdminTabsTabContent";

export interface BlockAdminTabsProps {
    children: BlockAdminComponentPart[];
}

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

const RouterTabLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>(function RouterTabLink(
    { href, ...props },
    ref,
) {
    return <Link {...props} ref={ref} to={href} />;
});

const Root = styled("div")`
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const TabBar = styled(Tabs)`
    flex-shrink: 0;
`;
