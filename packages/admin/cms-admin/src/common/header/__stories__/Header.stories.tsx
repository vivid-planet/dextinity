import { MainContent, MasterLayout } from "@dextinity/admin";
import { DextinityIcon, DextinityLogo } from "@dextinity/admin-icons";
import { Typography } from "@mui/material";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { Header } from "../Header";
import { UserHeaderItem } from "../UserHeaderItem";

type Story = StoryObj<typeof Header>;

const EmptyMenu = () => null;

/**
 * `Header` renders an `AppHeader`, which reads its height from `MasterLayout` — rendered on its own it collapses to
 * 0px. Passing the story as `headerComponent` mirrors how an application composes it.
 */
const renderInMasterLayout: Decorator = (Story) => (
    <MasterLayout headerComponent={Story} menuComponent={EmptyMenu}>
        <MainContent>
            <Typography>Page content</Typography>
        </MainContent>
    </MasterLayout>
);

const config: Meta<typeof Header> = {
    component: Header,
    title: "common/header/Header",
    decorators: [renderInMasterLayout],
};

export default config;

/** The default logo is the `light` wordmark, since the app header has a dark background. */
export const Default: Story = {
    render: () => <Header />,
};

/** The full composition: logo on the left, user menu on the right. "About/Copyright" opens the `AboutModal`. */
export const WithUserHeaderItem: Story = {
    render: () => (
        <Header>
            <UserHeaderItem />
        </Header>
    ),
};

/** Applications can replace the logo entirely via the `logo` prop. */
export const CustomLogo: Story = {
    render: () => <Header logo={<DextinityIcon sx={{ fontSize: 32 }} />} />,
};

/** The monochrome variant inherits `currentColor`, so it can be tinted to match a custom header color. */
export const CustomLogoMonochrome: Story = {
    render: () => <Header logo={<DextinityLogo variant="monochrome" htmlColor="white" sx={{ fontSize: 30 }} />} />,
};
