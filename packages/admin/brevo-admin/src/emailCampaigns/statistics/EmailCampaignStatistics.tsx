import { useQuery } from "@apollo/client";
import { Button, MainContent, StackLink, Toolbar, ToolbarActions, ToolbarBackButton, ToolbarFillSpace } from "@dextinity/admin";
import { Add as AddIcon } from "@dextinity/admin-icons";
import { ContentScopeIndicator, useContentScopeConfig } from "@dextinity/cms-admin";
import { Grid } from "@mui/material";
import type { ReactElement } from "react";
import { FormattedMessage } from "react-intl";

import { emailCampaignStatistics } from "./EmailCampaignStatistics.gql";
import type { GQLEmailCampaignStatisticsQuery, GQLEmailCampaignStatisticsQueryVariables } from "./EmailCampaignStatistics.gql.generated";
import { PercentageCard } from "./PercentageCard";

interface Props {
    id: string;
}

export const EmailCampaignStatistics = ({ id }: Props): ReactElement => {
    useContentScopeConfig({ redirectPathAfterChange: "/newsletter/email-campaigns" });

    const { data: campaignStatistics } = useQuery<GQLEmailCampaignStatisticsQuery, GQLEmailCampaignStatisticsQueryVariables>(
        emailCampaignStatistics,
        {
            variables: { id },
            fetchPolicy: "network-only",
        },
    );

    return (
        <>
            <Toolbar scopeIndicator={<ContentScopeIndicator />}>
                <ToolbarBackButton />
                <ToolbarFillSpace />
                <ToolbarActions>
                    <Button startIcon={<AddIcon />} component={StackLink} pageName="add" payload="add" variant="primary">
                        <FormattedMessage id="dextinity.emailCampaign.newEmailCampaign" defaultMessage="New email campaign" />
                    </Button>
                </ToolbarActions>
            </Toolbar>
            <MainContent>
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <PercentageCard
                            title={<FormattedMessage id="dextinity.emailCampaignStatistics.overallDelivery" defaultMessage="Overall delivery" />}
                            currentNumber={campaignStatistics?.brevoEmailCampaignStatistics?.delivered}
                            targetNumber={campaignStatistics?.brevoEmailCampaignStatistics?.sent}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <PercentageCard
                            title={
                                <FormattedMessage
                                    id="dextinity.emailCampaignStatistics.overallFailedDelivery"
                                    defaultMessage="Overall failed delivery"
                                />
                            }
                            currentNumber={
                                campaignStatistics?.brevoEmailCampaignStatistics
                                    ? campaignStatistics.brevoEmailCampaignStatistics?.sent -
                                      campaignStatistics.brevoEmailCampaignStatistics?.delivered
                                    : undefined
                            }
                            targetNumber={campaignStatistics?.brevoEmailCampaignStatistics?.sent}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <PercentageCard
                            title={<FormattedMessage id="dextinity.emailCampaignStatistics.uniqueViews" defaultMessage="Unique views" />}
                            variant="circle"
                            currentNumber={campaignStatistics?.brevoEmailCampaignStatistics?.uniqueViews}
                            targetNumber={campaignStatistics?.brevoEmailCampaignStatistics?.sent}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <PercentageCard
                            title={<FormattedMessage id="dextinity.emailCampaignStatistics.overallClicked" defaultMessage="Overall clicked" />}
                            variant="circle"
                            currentNumber={campaignStatistics?.brevoEmailCampaignStatistics?.uniqueClicks}
                            targetNumber={campaignStatistics?.brevoEmailCampaignStatistics?.sent}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <PercentageCard
                            title={<FormattedMessage id="dextinity.emailCampaignStatistics.overallBounce" defaultMessage="Overall bounce" />}
                            currentNumber={
                                campaignStatistics?.brevoEmailCampaignStatistics
                                    ? campaignStatistics.brevoEmailCampaignStatistics.softBounces +
                                      campaignStatistics.brevoEmailCampaignStatistics.hardBounces
                                    : undefined
                            }
                            targetNumber={campaignStatistics?.brevoEmailCampaignStatistics?.sent}
                            variant="circle"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <PercentageCard
                            title={<FormattedMessage id="dextinity.emailCampaignStatistics.unsubscriptions" defaultMessage="Unsubscriptions" />}
                            currentNumber={campaignStatistics?.brevoEmailCampaignStatistics?.unsubscriptions}
                            targetNumber={campaignStatistics?.brevoEmailCampaignStatistics?.sent}
                            variant="circle"
                        />
                    </Grid>
                </Grid>
            </MainContent>
        </>
    );
};
