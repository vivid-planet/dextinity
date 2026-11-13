import "@dextinity/ui/css";
import "@dextinity/ui/css/icons";
import "./dextinityUiIcons.css";

import { MainContent, Stack } from "@dextinity/admin";
import { Icon } from "@dextinity/ui";
import { Card, CardContent, Grid, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { PropsWithChildren, ReactNode } from "react";
import { FormattedMessage, useIntl } from "react-intl";

declare module "@dextinity/ui" {
    interface IconRegistry {
        "demo-logo": true;
        "demo-badge": true;
    }
}

export function DextinityUiPage() {
    const intl = useIntl();

    return (
        <Stack topLevelTitle={intl.formatMessage({ id: "dextinityUi", defaultMessage: "Dextinity UI" })}>
            <MainContent>
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
                            name="star-fill"
                            aria-label={intl.formatMessage({ id: "dextinityUi.icons.label.favorite", defaultMessage: "Favorite" })}
                        />
                        <BlueIcon
                            name="star-fill"
                            aria-label={intl.formatMessage({ id: "dextinityUi.icons.label.favorite", defaultMessage: "Favorite" })}
                        />
                    </IconCard>
                    <IconCard
                        title={<FormattedMessage id="dextinityUi.icons.defaultIconWithOwnColors" defaultMessage="Default icon with its own colors" />}
                    >
                        <LargeIcon
                            name="dextinity-color"
                            aria-label={intl.formatMessage({ id: "dextinityUi.icons.label.dextinity", defaultMessage: "Dextinity" })}
                        />
                    </IconCard>
                    <IconCard title={<FormattedMessage id="dextinityUi.icons.projectIcon" defaultMessage="Project icon, in the text color" />}>
                        <LargeIcon
                            name="demo-logo"
                            aria-label={intl.formatMessage({ id: "dextinityUi.icons.label.demoLogo", defaultMessage: "Demo logo" })}
                        />
                        <BlueIcon
                            name="demo-logo"
                            aria-label={intl.formatMessage({ id: "dextinityUi.icons.label.demoLogo", defaultMessage: "Demo logo" })}
                        />
                    </IconCard>
                    <IconCard
                        title={<FormattedMessage id="dextinityUi.icons.projectIconWithOwnColors" defaultMessage="Project icon with its own colors" />}
                    >
                        <LargeIcon
                            name="demo-badge"
                            aria-label={intl.formatMessage({ id: "dextinityUi.icons.label.demoBadge", defaultMessage: "Demo badge" })}
                        />
                    </IconCard>
                </Grid>
            </MainContent>
        </Stack>
    );
}

function IconCard({ title, children }: PropsWithChildren<{ title: ReactNode }>) {
    return (
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
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
