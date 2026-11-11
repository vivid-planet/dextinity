import type { GQLSendingState } from "../../graphql.generated";

interface EmailCampaignState {
    sendingState: GQLSendingState;
    scheduledAt?: string | null;
}

function isScheduledDateInPast({ scheduledAt }: EmailCampaignState, now = new Date()) {
    return scheduledAt != null && new Date(scheduledAt) < now;
}

/**
 * A campaign can be changed until it was sent or its scheduled date has passed, as Brevo may be sending it. A campaign whose sending
 * failed can be changed and sent again.
 */
export function isEmailCampaignEditable(campaign: EmailCampaignState) {
    return campaign.sendingState === "FAILED" || (campaign.sendingState !== "SENT" && !isScheduledDateInPast(campaign));
}

export function hasEmailCampaignStatistics(campaign: EmailCampaignState) {
    return campaign.sendingState === "SENT";
}
