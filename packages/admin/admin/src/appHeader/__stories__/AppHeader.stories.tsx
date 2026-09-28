import { Account, Dashboard, DextinityLogo, Language, Logout, Preview } from "@dextinity/admin-icons";
import { Avatar, Box, Divider, MenuItem, MenuList } from "@mui/material";

import { Button } from "../../common/buttons/Button";
import { FillSpace } from "../../common/FillSpace";
import { MainContent } from "../../common/MainContent";
import { MainNavigationItemRouterLink } from "../../mui/mainNavigation/ItemRouterLink";
import { MainNavigation } from "../../mui/mainNavigation/MainNavigation";
import { MasterLayout } from "../../mui/MasterLayout";
import { AppHeader } from "../AppHeader";
import { AppHeaderButton } from "../button/AppHeaderButton";
import { AppHeaderDropdown } from "../dropdown/AppHeaderDropdown";
import { AppHeaderMenuButton } from "../menuButton/AppHeaderMenuButton";

function AccountHeaderItem() {
    return (
        <Box display="flex" alignItems="center">
            <Avatar style={{ marginRight: 10 }}>
                <Account />
            </Avatar>
            User Name
        </Box>
    );
}

function Menu() {
    return (
        <MainNavigation>
            <MainNavigationItemRouterLink primary="Dashboard" icon={<Dashboard />} to="/dashboard" selected />
        </MainNavigation>
    );
}

function MasterHeader() {
    return (
        <AppHeader>
            <AppHeaderMenuButton />
            <DextinityLogo variant="light" sx={{ fontSize: 34 }} />
            <FillSpace />
            <AppHeaderButton startIcon={<Preview />}>Preview</AppHeaderButton>
            <AppHeaderDropdown buttonChildren="Language" startIcon={<Language />}>
                {(closeDropdown) => {
                    const onItemClicked = () => {
                        closeDropdown();
                        // Change language
                    };

                    return (
                        <MenuList>
                            <MenuItem onClick={onItemClicked}>DE</MenuItem>
                            <MenuItem onClick={onItemClicked}>EN</MenuItem>
                            <MenuItem onClick={onItemClicked}>FR</MenuItem>
                            <MenuItem onClick={onItemClicked}>ES</MenuItem>
                        </MenuList>
                    );
                }}
            </AppHeaderDropdown>
            <AppHeaderDropdown buttonChildren={<AccountHeaderItem />}>
                <MenuList>
                    <MenuItem>Edit Profile</MenuItem>
                    <MenuItem>Change Password</MenuItem>
                </MenuList>

                <Divider />

                <Box padding={4}>
                    <Button startIcon={<Logout />} fullWidth>
                        Logout
                    </Button>
                </Box>
            </AppHeaderDropdown>
        </AppHeader>
    );
}

export default {
    title: "components/appHeader/AppHeader",
    excludeStories: ["Story"],
};

export const _AppHeader = {
    render: () => {
        return (
            <MasterLayout menuComponent={Menu} headerComponent={MasterHeader}>
                <MainContent>Some content</MainContent>
            </MasterLayout>
        );
    },

    parameters: { layout: "fullscreen" },
};
