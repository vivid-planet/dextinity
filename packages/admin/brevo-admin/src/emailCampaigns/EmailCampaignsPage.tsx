import {
    Button,
    FillSpace,
    Stack,
    StackLink,
    StackPage,
    StackSwitch,
    StackToolbar,
    ToolbarActions,
    ToolbarAutomaticTitleItem,
    ToolbarBackButton,
} from "@dextinity/admin";
import { Time } from "@dextinity/admin-icons";
import { ActionLogsGrid, type BlockInterface, ContentScopeIndicator, useContentScope } from "@dextinity/cms-admin";
import type { JSX } from "react";
import { FormattedMessage, useIntl } from "react-intl";

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
                            <StackToolbar scopeIndicator={<ContentScopeIndicator scope={scope} />}>
                                <FillSpace />
                                <ToolbarActions>
                                    <Button variant="textDark" startIcon={<Time />} component={StackLink} pageName="action-log" payload="action-log">
                                        <FormattedMessage id="dextinity.actionLogButton.title" defaultMessage="Action Log" />
                                    </Button>
                                </ToolbarActions>
                            </StackToolbar>
                            <EmailCampaignsGrid scope={scope} EmailCampaignContentBlock={EmailCampaignContentBlock} />
                        </StackPage>
                        <StackPage
                            name="action-log"
                            title={intl.formatMessage({ id: "dextinity.emailCampaigns.actionLog", defaultMessage: "Action Log" })}
                        >
                            <StackToolbar scopeIndicator={<ContentScopeIndicator scope={scope} />}>
                                <ToolbarBackButton />
                                <ToolbarAutomaticTitleItem />
                            </StackToolbar>
                            <ActionLogsGrid entity="BrevoEmailCampaign" scope={scope} />
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
