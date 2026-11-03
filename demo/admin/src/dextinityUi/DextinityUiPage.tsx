import "@dextinity/ui/css";

import { MainContent, Stack } from "@dextinity/admin";
import { defaultIcons, Icon, Theme } from "@dextinity/ui";
import { Card, CardContent, Grid, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { PropsWithChildren, ReactNode } from "react";
import { FormattedMessage, useIntl } from "react-intl";

declare module "@dextinity/ui" {
    interface IconRegistry {
        "demo-logo": true;
    }
}

const icons = {
    ...defaultIcons,
    "demo-logo": new URL("./icons/demo-logo.svg#icon", import.meta.url).href,
};

export function DextinityUiPage() {
    const intl = useIntl();

    return (
        <Stack topLevelTitle={intl.formatMessage({ id: "dextinityUi", defaultMessage: "Dextinity UI" })}>
            <MainContent>
                <Theme icons={icons}>
                    <Typography variant="h2" gutterBottom>
                        <FormattedMessage id="dextinityUi.title" defaultMessage="Dextinity UI" />
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <FormattedMessage
                            id="dextinityUi.description"
                            defaultMessage="This page tests the <code>@dextinity/ui</code> library in a project, outside of its own Storybook."
                            values={{ code: (chunks) => <code>{chunks}</code> }}
                        />
                    </Typography>
                    <SectionTitle variant="h3" gutterBottom>
                        <FormattedMessage id="dextinityUi.icons" defaultMessage="Icons" />
                    </SectionTitle>
                    <Grid container spacing={4}>
                        <IconCard title={<FormattedMessage id="dextinityUi.icons.defaultIcon" defaultMessage="Default icon, in the text color" />}>
                            <LargeIcon
                                icon="favorite"
                                aria-label={intl.formatMessage({ id: "dextinityUi.icons.label.favorite", defaultMessage: "Favorite" })}
                            />
                            <BlueIcon
                                icon="favorite"
                                aria-label={intl.formatMessage({ id: "dextinityUi.icons.label.favorite", defaultMessage: "Favorite" })}
                            />
                        </IconCard>
                        <IconCard
                            title={
                                <FormattedMessage id="dextinityUi.icons.defaultIconWithOwnColors" defaultMessage="Default icon with its own colors" />
                            }
                        >
                            <LargeIcon
                                icon="youtube-filled-color"
                                aria-label={intl.formatMessage({ id: "dextinityUi.icons.label.youtube", defaultMessage: "YouTube" })}
                            />
                            <LargeIcon
                                icon="jira-color"
                                aria-label={intl.formatMessage({ id: "dextinityUi.icons.label.jira", defaultMessage: "Jira" })}
                            />
                        </IconCard>
                        <IconCard title={<FormattedMessage id="dextinityUi.icons.projectIcon" defaultMessage="Custom project icon" />}>
                            <LargeIcon
                                icon="demo-logo"
                                aria-label={intl.formatMessage({ id: "dextinityUi.icons.label.demoLogo", defaultMessage: "Demo logo" })}
                            />
                            <BlueIcon
                                icon="demo-logo"
                                aria-label={intl.formatMessage({ id: "dextinityUi.icons.label.demoLogo", defaultMessage: "Demo logo" })}
                            />
                        </IconCard>
                    </Grid>
                </Theme>
            </MainContent>
        </Stack>
    );
}

function IconCard({ title, children }: PropsWithChildren<{ title: ReactNode }>) {
    return (
        <Grid size={{ xs: 12, md: 4 }}>
            <FullHeightCard>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        {title}
                    </Typography>
                    <IconRow>{children}</IconRow>
                </CardContent>
            </FullHeightCard>
        </Grid>
    );
}

const SectionTitle = styled(Typography)`
    margin-top: ${({ theme }) => theme.spacing(4)};
`;

const FullHeightCard = styled(Card)`
    height: 100%;
`;

const IconRow = styled("div")`
    display: flex;
    justify-content: space-evenly;
    align-items: center;
`;

const LargeIcon = styled(Icon)`
    width: 48px;
    height: 48px;
`;

const BlueIcon = styled(LargeIcon)`
    color: royalblue;
`;
