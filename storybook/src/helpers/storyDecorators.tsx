import { AppHeader, AppHeaderMenuButton, MainNavigation, MainNavigationItemRouterLink, MasterLayout, Stack, useWindowSize } from "@dextinity/admin";
import { Dashboard } from "@dextinity/admin-icons";
import { useTheme } from "@mui/material";
import type { ComponentType } from "react";
import { Route } from "react-router";

export function masterLayoutDecorator() {
    const MasterHeader = () => (
        <AppHeader>
            <AppHeaderMenuButton />
        </AppHeader>
    );

    const MasterMenu = () => {
        const windowSize = useWindowSize();
        const { breakpoints } = useTheme();
        const useTemporaryMenu: boolean = windowSize.width < breakpoints.values.md;

        return (
            <MainNavigation variant={useTemporaryMenu ? "temporary" : "permanent"}>
                <MainNavigationItemRouterLink primary="Example Page" to="/" icon={<Dashboard />} />
            </MainNavigation>
        );
    };

    return (Story: ComponentType) => {
        return (
            <MasterLayout menuComponent={MasterMenu} headerComponent={MasterHeader}>
                <Story />
            </MasterLayout>
        );
    };
}

export function stackRouteDecorator(topLevelTitle = "Example Page") {
    return (Story: ComponentType) => {
        return (
            <Route
                render={() => (
                    <Stack topLevelTitle={topLevelTitle}>
                        <Story />
                    </Stack>
                )}
            />
        );
    };
}
