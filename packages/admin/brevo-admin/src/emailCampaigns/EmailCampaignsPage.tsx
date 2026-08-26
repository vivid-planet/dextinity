import { Stack, StackPage, StackSwitch, StackToolbar } from "@dextinity/admin";
import { type BlockInterface, ContentScopeIndicator, useContentScope } from "@dextinity/cms-admin";
import type { JSX } from "react";
import { useIntl } from "react-intl";

import { useBrevoConfig } from "../common/BrevoConfigProvider";
import { ConfigVerification } from "../configVerification/ConfigVerification";
import { EmailCampaignsGrid } from "./EmailCampaignsGrid";
import { EmailCampaignForm } from "./form/EmailCampaignForm";
import { EmailCampaignStatistics } from "./statistics/EmailCampaignStatistics";
import { EmailCampaignView } from "./view/EmailCampaignView";

interface CreateEmailCampaignsPageOptions {
    EmailCampaignContentBlock: BlockInterface;
}

export function createEmailCampaignsPage({ EmailCampaignContentBlock }: CreateEmailCampaignsPageOptions) {
    function EmailCampaignsPage(): JSX.Element {
        const { scopeParts } = useBrevoConfig();
        const { scope: completeScope } = useContentScope();
        const intl = useIntl();

        const scope = scopeParts.reduce(
            (acc, scopePart) => {
                acc[scopePart] = completeScope[scopePart];
                return acc;
            },
            {} as { [key: string]: unknown },
        );

        return (
            <ConfigVerification scope={scope}>
                <Stack
                    topLevelTitle={intl.formatMessage({
                        id: "dextinity.emailCampaigns.emailCampaigns",
                        defaultMessage: "Email campaigns",
                    })}
                >
                    <StackSwitch>
                        <StackPage name="grid">
                            <StackToolbar scopeIndicator={<ContentScopeIndicator scope={scope} />} />
                            <EmailCampaignsGrid scope={scope} EmailCampaignContentBlock={EmailCampaignContentBlock} />
                        </StackPage>
                        <StackPage name="statistics">{(selectedId) => <EmailCampaignStatistics id={selectedId} />}</StackPage>
                        <StackPage name="view">
                            {(selectedId) => <EmailCampaignView id={selectedId} EmailCampaignContentBlock={EmailCampaignContentBlock} />}
                        </StackPage>

                        <StackPage
                            name="edit"
                            title={intl.formatMessage({
                                id: "dextinity.emailCampaigns.editEmailCampaign",
                                defaultMessage: "Edit email campaign",
                            })}
                        >
                            {(selectedId) => (
                                <EmailCampaignForm id={selectedId} EmailCampaignContentBlock={EmailCampaignContentBlock} scope={scope} />
                            )}
                        </StackPage>
                        <StackPage
                            name="add"
                            title={intl.formatMessage({
                                id: "dextinity.emailCampaigns.addEmailCampaign",
                                defaultMessage: "Add email campaign",
                            })}
                        >
                            <EmailCampaignForm EmailCampaignContentBlock={EmailCampaignContentBlock} scope={scope} />
                        </StackPage>
                    </StackSwitch>
                </Stack>
            </ConfigVerification>
        );
    }
    return EmailCampaignsPage;
}
