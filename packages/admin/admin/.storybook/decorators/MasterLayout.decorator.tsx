import { Dashboard } from "@dextinity/admin-icons";
import { useTheme } from "@mui/material";
import type { Decorator } from "@storybook/react-vite";

import { AppHeader } from "../../src/appHeader/AppHeader";
import { AppHeaderMenuButton } from "../../src/appHeader/menuButton/AppHeaderMenuButton";
import { useWindowSize } from "../../src/helpers/useWindowSize";
import { MainNavigationItemRouterLink } from "../../src/mui/mainNavigation/ItemRouterLink";
import { MainNavigation } from "../../src/mui/mainNavigation/MainNavigation";
import { MasterLayout } from "../../src/mui/MasterLayout";

function MasterHeader() {
    return (
        <AppHeader>
            <AppHeaderMenuButton />
        </AppHeader>
    );
}

function MasterMenu() {
    const windowSize = useWindowSize();
    const { breakpoints } = useTheme();
    const useTemporaryMenu = windowSize.width < breakpoints.values.md;

    return (
        <MainNavigation variant={useTemporaryMenu ? "temporary" : "permanent"}>
            <MainNavigationItemRouterLink primary="Example Page" to="/" icon={<Dashboard />} />
        </MainNavigation>
    );
}

export const MasterLayoutDecorator: Decorator = (Story) => (
    <MasterLayout menuComponent={MasterMenu} headerComponent={MasterHeader}>
        <Story />
    </MasterLayout>
);
