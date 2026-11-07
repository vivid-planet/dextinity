import { useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import {
    BlockContentEditor,
    type BlockInterface,
    type ContentScope,
    useBlockContext,
    useBlockPreview,
    useRouterLinkClick,
} from "@dextinity/cms-admin";
import { Button, EmptyState, Icon, KeyValueList, PageHeader } from "@dextinity/ui";
import { FormattedDate, useIntl } from "react-intl";
import { useRouteMatch } from "react-router";

import { useBrevoConfig } from "../../common/BrevoConfigProvider";
import { hasEmailCampaignStatistics } from "../common/emailCampaignActions";
import { EmailCampaignSendingState } from "../common/EmailCampaignSendingState";
import { emailCampaignViewQuery } from "./EmailCampaignView.gql";
import type { GQLEmailCampaignViewQuery, GQLEmailCampaignViewQueryVariables } from "./EmailCampaignView.gql.generated";

interface EmailCampaignViewProps {
    baseUrl: string;
    id: string;
    scope: ContentScope;
    scopeLabel: string;
    EmailCampaignContentBlock: BlockInterface;
}

/** A campaign that can't be changed anymore, as it was sent or Brevo is sending it: its details next to the preview of its content. */
export function EmailCampaignView({ baseUrl, id, scope, scopeLabel, EmailCampaignContentBlock }: EmailCampaignViewProps) {
    const intl = useIntl();
    const match = useRouteMatch();
    const navigateWithRouter = useRouterLinkClick();
    const previewApi = useBlockPreview();
    const blockContext = useBlockContext();
    const { previewUrl } = useBrevoConfig();
    const { data, error, loading } = useQuery<GQLEmailCampaignViewQuery, GQLEmailCampaignViewQueryVariables>(emailCampaignViewQuery, {
        variables: { id },
        context: LocalErrorScopeApolloContext,
    });
    const campaign = data?.brevoEmailCampaign;

    const header = (
        <PageHeader
            variant="compact"
            back={{ label: intl.formatMessage({ id: "dextinity.emailCampaigns.emailCampaigns", defaultMessage: "Email campaigns" }), href: baseUrl }}
            slotProps={{ back: { onClick: navigateWithRouter } }}
            eyebrow={[intl.formatMessage({ id: "dextinity.emailCampaigns.emailCampaign", defaultMessage: "Email campaign" }), scopeLabel]
                .filter(Boolean)
                .join(" · ")}
            title={
                error
                    ? intl.formatMessage({ id: "dextinity.emailCampaigns.loadFailed", defaultMessage: "This campaign can't be opened" })
                    : (campaign?.title ?? intl.formatMessage({ id: "dextinity.emailCampaigns.loading", defaultMessage: "Loading campaign …" }))
            }
            subtitle={campaign ? <EmailCampaignSendingState sendingState={campaign.sendingState} /> : undefined}
            actions={
                campaign && hasEmailCampaignStatistics(campaign) ? (
                    <Button
                        variant="outlined"
                        color="secondary"
                        href={`${baseUrl}/${id}/statistics`}
                        onClick={navigateWithRouter}
                        startIcon={<Icon name="statistics" />}
                    >
                        {intl.formatMessage({ id: "dextinity.emailCampaigns.statistics", defaultMessage: "Statistics" })}
                    </Button>
                ) : undefined
            }
        />
    );

    if (error) {
        return (
            <BlockContentEditor
                header={header}
                tabs={[{ key: "details", label: "", content: <EmptyState icon={<Icon name="warning" />} title={error.message} /> }]}
            />
        );
    }

    const notSet = intl.formatMessage({ id: "dextinity.emailCampaigns.notSet", defaultMessage: "–" });

    return (
        <BlockContentEditor
            header={header}
            loading={loading || campaign == null}
            previewApi={previewApi}
            preview={{
                url: previewUrl,
                state: campaign
                    ? {
                          emailCampaignId: id,
                          scope,
                          content: EmailCampaignContentBlock.createPreviewState(EmailCampaignContentBlock.input2State(campaign.content), {
                              ...blockContext,
                              parentUrl: match.url,
                              showVisibleOnly: previewApi.showOnlyVisible,
                          }),
                      }
                    : undefined,
            }}
            tabs={[
                {
                    key: "details",
                    label: intl.formatMessage({ id: "dextinity.emailCampaigns.details", defaultMessage: "Details" }),
                    content: campaign ? (
                        <KeyValueList
                            items={[
                                {
                                    key: intl.formatMessage({ id: "dextinity.emailCampaigns.subject", defaultMessage: "Subject" }),
                                    value: campaign.subject,
                                },
                                {
                                    key: intl.formatMessage({ id: "dextinity.emailCampaigns.sendingState", defaultMessage: "Status" }),
                                    value: <EmailCampaignSendingState sendingState={campaign.sendingState} />,
                                },
                                {
                                    key: intl.formatMessage({ id: "dextinity.emailCampaigns.targetGroups", defaultMessage: "Target groups" }),
                                    value:
                                        campaign.brevoTargetGroups.length > 0
                                            ? intl.formatList(campaign.brevoTargetGroups.map((targetGroup) => targetGroup.title))
                                            : notSet,
                                },
                                {
                                    key: intl.formatMessage({ id: "dextinity.emailCampaigns.scheduledFor", defaultMessage: "Scheduled for" }),
                                    value: campaign.scheduledAt ? (
                                        <FormattedDate value={campaign.scheduledAt} dateStyle="medium" timeStyle="short" />
                                    ) : (
                                        notSet
                                    ),
                                },
                                {
                                    key: intl.formatMessage({ id: "dextinity.emailCampaigns.updatedAt", defaultMessage: "Last changed" }),
                                    value: <FormattedDate value={campaign.updatedAt} dateStyle="medium" timeStyle="short" />,
                                },
                            ]}
                        />
                    ) : null,
                },
            ]}
        />
    );
}
