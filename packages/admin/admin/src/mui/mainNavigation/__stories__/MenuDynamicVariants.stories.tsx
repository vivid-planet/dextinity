import { Dashboard, DextinityIcon, DextinityLogo, LinkExternal, Settings, Sort } from "@dextinity/admin-icons";
import { Card, CardContent, Divider, Typography } from "@mui/material";
import { useEffect } from "react";
import { matchPath, Route, Switch, useLocation } from "react-router";
import { Link } from "react-router-dom";

import { AppHeader } from "../../../appHeader/AppHeader";
import { AppHeaderMenuButton } from "../../../appHeader/menuButton/AppHeaderMenuButton";
import { FillSpace } from "../../../common/FillSpace";
import { MainContent } from "../../../common/MainContent";
import { useWindowSize } from "../../../helpers/useWindowSize";
import { MasterLayout } from "../../MasterLayout";
import { MainNavigationCollapsibleItem } from "../CollapsibleItem";
import { useMainNavigation } from "../Context";
import { MainNavigationItemAnchorLink } from "../ItemAnchorLink";
import { MainNavigationItemRouterLink } from "../ItemRouterLink";
import { MainNavigation } from "../MainNavigation";

const permanentMenuMinWidth = 1024;
const pathsToAlwaysUseTemporaryMenu = ["/foo3", "/foo4"];

const AppMenu = () => {
    const { open, toggleOpen } = useMainNavigation();
    const windowSize = useWindowSize();
    const location = useLocation();

    let useTemporaryMenu: boolean = windowSize.width < permanentMenuMinWidth;

    if (matchPath(location.pathname, { path: pathsToAlwaysUseTemporaryMenu, strict: true })) {
        useTemporaryMenu = true;
    }

    // Open menu when changing to permanent variant and close when changing to temporary variant.
    useEffect(() => {
        if ((useTemporaryMenu && open) || (!useTemporaryMenu && !open)) {
            toggleOpen();
        }
        // useEffect dependencies must only include `location`, because the function should only be called once after changing the location.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    return (
        <MainNavigation variant={useTemporaryMenu ? "temporary" : "permanent"}>
            <MainNavigationItemRouterLink primary="Dashboard" icon={<Dashboard />} to="/dashboard" />
            <MainNavigationItemRouterLink primary="Settings" icon={<Settings />} to="/settings" />
            <MainNavigationCollapsibleItem primary="More Items" icon={<Sort />}>
                <MainNavigationItemRouterLink primary="Foo1" to="/foo1" />
                <MainNavigationItemRouterLink primary="Foo2" to="/foo2" />
            </MainNavigationCollapsibleItem>
            <MainNavigationCollapsibleItem primary="Even More Items" secondary="Forcing temporary menu" icon={<Sort />}>
                <MainNavigationItemRouterLink primary="Foo3" to="/foo3" />
                <MainNavigationItemRouterLink primary="Foo4" to="/foo4" />
            </MainNavigationCollapsibleItem>
            <MainNavigationItemAnchorLink
                primary="Dextinity"
                secondary="View on GitHub"
                target="_blank"
                href="https://github.com/vivid-planet/dextinity"
                icon={<DextinityIcon />}
                secondaryAction={<LinkExternal />}
            />
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
                <Typography variant="h4" gutterBottom>
                    {children}
                </Typography>
                <Typography gutterBottom>
                    The menu is permanent by default and is temporary below {permanentMenuMinWidth}px and for the routes:{" "}
                    {pathsToAlwaysUseTemporaryMenu.join(", ")}.
                    <br />
                    This is useful, when specific pages need some extra width.
                </Typography>
                <Divider />
                <br />
                <Typography variant="body2">Links for testing menu-behaviour when location changes without menu-interaction:</Typography>
                <ul>
                    <li>
                        <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li>
                        <Link to="/settings">Settings</Link>
                    </li>
                    <li>
                        <Link to="/foo1">Foo1</Link>
                    </li>
                    <li>
                        <Link to="/foo2">Foo2</Link>
                    </li>
                    <li>
                        <Link to="/foo3">Foo3</Link>
                    </li>
                    <li>
                        <Link to="/foo4">Foo4</Link>
                    </li>
                </ul>
            </CardContent>
        </Card>
    </MainContent>
);

export default {
    title: "components/mui/mainNavigation/MenuDynamicVariants",
};

export const MenuDynamicVariants = {
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
            </Switch>
        </MasterLayout>
    ),

    name: "Menu (dynamic variants)",
    parameters: { layout: "fullscreen" },
};
