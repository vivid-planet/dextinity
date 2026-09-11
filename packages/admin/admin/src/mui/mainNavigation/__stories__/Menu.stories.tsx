import { Dashboard, DextinityIcon, DextinityLogo, Settings, Sort } from "@dextinity/admin-icons";
import { Card, CardContent, Typography } from "@mui/material";
import { Route, Switch } from "react-router";

import { AppHeader } from "../../../appHeader/AppHeader";
import { AppHeaderMenuButton } from "../../../appHeader/menuButton/AppHeaderMenuButton";
import { FillSpace } from "../../../common/FillSpace";
import { MainContent } from "../../../common/MainContent";
import { useWindowSize } from "../../../helpers/useWindowSize";
import { MasterLayout } from "../../MasterLayout";
import { MainNavigationCollapsibleItem } from "../CollapsibleItem";
import { MainNavigationItemAnchorLink } from "../ItemAnchorLink";
import { MainNavigationItemGroup } from "../ItemGroup";
import { MainNavigationItemRouterLink } from "../ItemRouterLink";
import { MainNavigation } from "../MainNavigation";

const permanentMenuMinWidth = 1024;

const AppMenu = () => {
    const windowSize = useWindowSize();

    return (
        <MainNavigation variant={windowSize.width < permanentMenuMinWidth ? "temporary" : "permanent"}>
            <MainNavigationItemGroup title="Some Group">
                <MainNavigationItemRouterLink primary="Dashboard" icon={<Dashboard />} to="/dashboard" />
                <MainNavigationCollapsibleItem primary="More Items" icon={<Sort />}>
                    <MainNavigationItemRouterLink primary="Foo1" to="/foo1" />
                    <MainNavigationItemRouterLink primary="Foo2" to="/foo2" />
                </MainNavigationCollapsibleItem>
                <MainNavigationCollapsibleItem primary="Even More Items" icon={<Sort />}>
                    <MainNavigationItemRouterLink primary="Foo3" to="/foo3" />
                    <MainNavigationItemRouterLink primary="Foo4" to="/foo4" />
                    <MainNavigationCollapsibleItem primary="Wow there can be even more">
                        <MainNavigationItemRouterLink primary="Foo5" to="/foo5" />
                        <MainNavigationItemRouterLink primary="Foo6" to="/foo6" />
                    </MainNavigationCollapsibleItem>
                </MainNavigationCollapsibleItem>
            </MainNavigationItemGroup>
            <MainNavigationItemGroup title="Further Layers">
                <MainNavigationItemRouterLink primary="Settings" badgeContent={2} icon={<Settings />} to="/settings" />
                <MainNavigationItemAnchorLink
                    primary="Dextinity"
                    secondary="View on GitHub"
                    target="_blank"
                    href="https://github.com/vivid-planet/dextinity"
                    icon={<DextinityIcon />}
                />
            </MainNavigationItemGroup>
        </MainNavigation>
    );
};

const Header = () => (
    <AppHeader>
        <AppHeaderMenuButton />
        <DextinityLogo variant="light" sx={{ fontSize: 34 }} />
        <FillSpace />
    </AppHeader>
);

const Content = ({ children }: { children: string }) => (
    <MainContent>
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h1" gutterBottom>
                    {children}
                </Typography>
                <Typography>The navigation is permanent by default and is temporary below {permanentMenuMinWidth}px.</Typography>
            </CardContent>
        </Card>
    </MainContent>
);

export default {
    title: "components/mui/mainNavigation/Menu",
    excludeStories: ["Story"],
};

export const _Menu = {
    render: () => (
        <MasterLayout headerComponent={Header} menuComponent={AppMenu}>
            <Switch>
                <Route path="/" exact render={() => <Content>Root</Content>} />
                <Route path="/dashboard" render={() => <Content>Dashboard</Content>} />
                <Route path="/settings" render={() => <Content>Settings</Content>} />
                <Route path="/foo1" render={() => <Content>Foo 1</Content>} />
                <Route path="/foo2" render={() => <Content>Foo 2</Content>} />
                <Route path="/foo3" render={() => <Content>Foo 3</Content>} />
                <Route path="/foo4" render={() => <Content>Foo 4</Content>} />
                <Route path="/foo5" render={() => <Content>Foo 5</Content>} />
                <Route path="/foo6" render={() => <Content>Foo 6</Content>} />
            </Switch>
        </MasterLayout>
    ),

    parameters: { layout: "fullscreen" },
};
