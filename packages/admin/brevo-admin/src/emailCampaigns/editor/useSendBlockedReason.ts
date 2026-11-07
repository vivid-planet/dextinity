import { useIntl } from "react-intl";

import type { GQLEmailCampaignEditorFragment } from "./EmailCampaignEditor.gql.generated";

interface SendBlockedReasonOptions {
    savedCampaign?: GQLEmailCampaignEditorFragment;
    hasUnsavedChanges: boolean;
}

/** Why the campaign can't be sent yet, neither to its target groups nor as a test: Brevo sends the saved version to the saved target groups. */
export function useSendBlockedReason({ savedCampaign, hasUnsavedChanges }: SendBlockedReasonOptions): string | undefined {
    const intl = useIntl();
    if (savedCampaign == null) {
        return intl.formatMessage({ id: "dextinity.emailCampaigns.sendBlocked.unsaved", defaultMessage: "Save the campaign first" });
    }
    if (savedCampaign.brevoTargetGroups.length === 0) {
        return intl.formatMessage({
            id: "dextinity.emailCampaigns.sendBlocked.noTargetGroups",
            defaultMessage: "Choose target groups and save the campaign first",
        });
    }
    if (hasUnsavedChanges) {
        return intl.formatMessage({ id: "dextinity.emailCampaigns.sendBlocked.unsavedChanges", defaultMessage: "Save your changes first" });
    }
    return undefined;
}
