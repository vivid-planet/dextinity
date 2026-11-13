import { useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import { useRouterLinkClick } from "@dextinity/cms-admin";
import { Button, Card, Icon, OverviewLayout, Skeleton, StatTile } from "@dextinity/ui";
import type { ReactNode } from "react";
import { useIntl } from "react-intl";

import { emailCampaignStatisticsQuery } from "./EmailCampaignStatistics.gql";
import type { GQLEmailCampaignStatisticsQuery, GQLEmailCampaignStatisticsQueryVariables } from "./EmailCampaignStatistics.gql.generated";
import { FullWidthBanner, Tiles } from "./EmailCampaignStatistics.sc";

type CampaignStatistics = NonNullable<GQLEmailCampaignStatisticsQuery["brevoEmailCampaignStatistics"]>;

interface EmailCampaignStatisticsProps {
    baseUrl: string;
    id: string;
    scopeLabel: string;
}

function sum(...counts: Array<number | null | undefined>) {
    return counts.every((count) => count != null) ? counts.reduce<number>((total, count) => total + (count ?? 0), 0) : null;
}

/** How a sent campaign performed according to Brevo: delivery, engagement, and problems, each as a share of the sent emails. */
export function EmailCampaignStatistics({ baseUrl, id, scopeLabel }: EmailCampaignStatisticsProps) {
    const intl = useIntl();
    const navigateWithRouter = useRouterLinkClick();
    const { data, error, refetch, loading } = useQuery<GQLEmailCampaignStatisticsQuery, GQLEmailCampaignStatisticsQueryVariables>(
        emailCampaignStatisticsQuery,
        {
            variables: { id },
            fetchPolicy: "network-only",
            errorPolicy: "all",
            notifyOnNetworkStatusChange: true,
            context: LocalErrorScopeApolloContext,
        },
    );
    const campaign = data?.brevoEmailCampaign;
    const statistics: Partial<CampaignStatistics> = data?.brevoEmailCampaignStatistics ?? {};
    const sent = statistics.sent;

    const formatCount = (count: number | null | undefined) => (count == null ? "–" : intl.formatNumber(count));
    const formatShare = (count: number | null | undefined) =>
        count == null || sent == null || sent <= 0 ? "–" : intl.formatNumber((count / sent) * 100, { maximumFractionDigits: 1 });
    const shareContext = (count: number | null | undefined) =>
        intl.formatMessage(
            { id: "dextinity.emailCampaignStatistics.ofSent", defaultMessage: "{count} of {sent} sent" },
            { count: formatCount(count), sent: formatCount(sent) },
        );
    const isLoadingInitially = loading && data == null;
    const renderShare = (label: string, count: number | null | undefined, context?: ReactNode) =>
        isLoadingInitially ? (
            <Skeleton variant="tile" />
        ) : (
            <StatTile value={formatShare(count)} unit={count == null ? undefined : "%"} label={label} context={context ?? shareContext(count)} />
        );

    return (
        <OverviewLayout
            back={{ label: intl.formatMessage({ id: "dextinity.emailCampaigns.emailCampaigns", defaultMessage: "Email campaigns" }), href: baseUrl }}
            slotProps={{ back: { onClick: navigateWithRouter } }}
            eyebrow={[
                intl.formatMessage({ id: "dextinity.emailCampaignStatistics.eyebrow", defaultMessage: "Email campaign statistics" }),
                scopeLabel,
            ]
                .filter(Boolean)
                .join(" · ")}
            title={campaign?.title ?? (isLoadingInitially ? <Skeleton variant="text" width="18rem" /> : "")}
            summary={
                campaign
                    ? intl.formatMessage(
                          {
                              id: "dextinity.emailCampaignStatistics.summary",
                              defaultMessage:
                                  "“{subject}” {hasTargetGroups, select, true {went to {targetGroups}} other {was sent}}. <viewLink>View the campaign</viewLink> or go back to <listLink>all campaigns</listLink>.",
                          },
                          {
                              subject: campaign.subject,
                              hasTargetGroups: String(campaign.brevoTargetGroups.length > 0),
                              targetGroups: intl.formatList(campaign.brevoTargetGroups.map((targetGroup) => targetGroup.title)),
                              viewLink: (chunks: ReactNode[]) => (
                                  <a href={`${baseUrl}/${id}/view`} onClick={navigateWithRouter}>
                                      {chunks}
                                  </a>
                              ),
                              listLink: (chunks: ReactNode[]) => (
                                  <a href={baseUrl} onClick={navigateWithRouter}>
                                      {chunks}
                                  </a>
                              ),
                          },
                      )
                    : isLoadingInitially && <Skeleton variant="text" width="28rem" />
            }
        >
            {error && (
                <FullWidthBanner
                    tone="error"
                    action={
                        <Button variant="outlined" color="secondary" size="small" loading={loading} onClick={() => void refetch()}>
                            {intl.formatMessage({ id: "dextinity.emailCampaignStatistics.retry", defaultMessage: "Try again" })}
                        </Button>
                    }
                >
                    {intl.formatMessage(
                        { id: "dextinity.emailCampaignStatistics.loadFailed", defaultMessage: "Brevo's statistics couldn't be loaded: {reason}" },
                        { reason: error.message },
                    )}
                </FullWidthBanner>
            )}
            <Card
                title={intl.formatMessage({ id: "dextinity.emailCampaignStatistics.delivery", defaultMessage: "Delivery" })}
                icon={<Icon name="mail-out" />}
                meta={intl.formatMessage(
                    { id: "dextinity.emailCampaignStatistics.sentCount", defaultMessage: "{count} sent" },
                    { count: formatCount(sent) },
                )}
            >
                <Tiles>
                    {renderShare(
                        intl.formatMessage({ id: "dextinity.emailCampaignStatistics.delivered", defaultMessage: "Delivered" }),
                        statistics.delivered,
                    )}
                    {renderShare(
                        intl.formatMessage({ id: "dextinity.emailCampaignStatistics.failedDelivery", defaultMessage: "Not delivered" }),
                        sent != null && statistics.delivered != null ? sent - statistics.delivered : null,
                    )}
                    {renderShare(
                        intl.formatMessage({ id: "dextinity.emailCampaignStatistics.bounces", defaultMessage: "Bounced" }),
                        sum(statistics.softBounces, statistics.hardBounces),
                        intl.formatMessage(
                            { id: "dextinity.emailCampaignStatistics.bouncesContext", defaultMessage: "{soft} soft · {hard} hard" },
                            { soft: formatCount(statistics.softBounces), hard: formatCount(statistics.hardBounces) },
                        ),
                    )}
                </Tiles>
            </Card>
            <Card
                title={intl.formatMessage({ id: "dextinity.emailCampaignStatistics.engagement", defaultMessage: "Engagement" })}
                icon={<Icon name="eye" />}
            >
                <Tiles>
                    {renderShare(
                        intl.formatMessage({ id: "dextinity.emailCampaignStatistics.opened", defaultMessage: "Opened" }),
                        statistics.uniqueViews,
                    )}
                    {renderShare(
                        intl.formatMessage({ id: "dextinity.emailCampaignStatistics.uniqueClicks", defaultMessage: "Clicked" }),
                        statistics.uniqueClicks,
                    )}
                    {renderShare(
                        intl.formatMessage({ id: "dextinity.emailCampaignStatistics.unsubscribed", defaultMessage: "Unsubscribed" }),
                        statistics.unsubscriptions,
                    )}
                    {renderShare(
                        intl.formatMessage({ id: "dextinity.emailCampaignStatistics.complaints", defaultMessage: "Marked as spam" }),
                        statistics.complaints,
                    )}
                </Tiles>
            </Card>
        </OverviewLayout>
    );
}
