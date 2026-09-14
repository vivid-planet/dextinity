import { AppHeader, AppHeaderMenuButton, FillSpace, MainContent } from "@dextinity/admin";
import { DextinityLogo } from "@dextinity/admin-icons";
import { Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import type { ContentScopeParameters } from "../../storybook";
import { ContentScopeIndicator } from "../ContentScopeIndicator";
import { ContentScopeControls } from "../Controls";
import { ContentScopeProvider, useContentScope } from "../Provider";

const optionalDimensions: ContentScopeParameters = {
    values: [
        { scope: { organizationId: "organization-1" }, label: { organizationId: "Organization 1" } },
        { scope: { organizationId: "organization-2" }, label: { organizationId: "Organization 2" } },
        { scope: { channelId: "channel-1" }, label: { channelId: "Channel 1" } },
        { scope: { channelId: "channel-2" }, label: { channelId: "Channel 2" } },
    ],
    defaultValue: { organizationId: "organization-1" },
};

type Story = StoryObj<typeof ContentScopeProvider>;
const config: Meta<typeof ContentScopeProvider> = {
    component: ContentScopeProvider,
    title: "contentScope/ContentScopeProvider",
    parameters: {
        contentScope: optionalDimensions,
    },
};

export default config;

function PrintContentScope() {
    const { scope } = useContentScope();

    return <>{JSON.stringify(scope)}</>;
}

export const OptionalDimensions: Story = {
    render: () => {
        const { match } = useContentScope();

        return (
            <>
                <AppHeader position="relative" headerHeight={60}>
                    <AppHeaderMenuButton />
                    <DextinityLogo variant="light" sx={{ fontSize: 34 }} />
                    <FillSpace />
                    <ContentScopeControls />
                </AppHeader>
                <MainContent>
                    <ContentScopeIndicator />
                    <Typography gutterBottom>
                        This is a development story to test optional scope dimensions in the content scope provider. Try changing the scope in the
                        content scope select.
                    </Typography>
                    <Typography>
                        Path: <strong>{match.path}</strong>
                    </Typography>
                    <Typography>
                        URL: <strong>{match.url}</strong>
                    </Typography>
                    <Typography>
                        Scope:{" "}
                        <strong>
                            <PrintContentScope />
                        </strong>
                    </Typography>
                </MainContent>
            </>
        );
    },
};
