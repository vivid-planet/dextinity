import { StatusIndicator, type StatusIndicatorStatus } from "@dextinity/ui";
import { defineMessages, useIntl } from "react-intl";

import type { GQLSendingState } from "../../graphql.generated";

export const sendingStates: GQLSendingState[] = ["DRAFT", "SCHEDULED", "SENT", "FAILED"];

export const sendingStateMessages = defineMessages<GQLSendingState>({
    DRAFT: { id: "dextinity.emailCampaigns.sendingState.draft", defaultMessage: "Draft" },
    SCHEDULED: { id: "dextinity.emailCampaigns.sendingState.scheduled", defaultMessage: "Scheduled" },
    SENT: { id: "dextinity.emailCampaigns.sendingState.sent", defaultMessage: "Sent" },
    FAILED: { id: "dextinity.emailCampaigns.sendingState.failed", defaultMessage: "Failed" },
});

export const sendingStateStatus: Record<GQLSendingState, StatusIndicatorStatus> = {
    DRAFT: "unpublished",
    SCHEDULED: "info",
    SENT: "published",
    FAILED: "critical",
};

interface EmailCampaignSendingStateProps {
    sendingState: GQLSendingState;
}

export function EmailCampaignSendingState({ sendingState }: EmailCampaignSendingStateProps) {
    const intl = useIntl();
    return <StatusIndicator status={sendingStateStatus[sendingState]}>{intl.formatMessage(sendingStateMessages[sendingState])}</StatusIndicator>;
}
