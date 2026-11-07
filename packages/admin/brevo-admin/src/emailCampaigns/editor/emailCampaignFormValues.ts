import type { BlockInterface, BlockState } from "@dextinity/cms-admin";
import { deepEqual } from "fast-equals";
import { useField } from "react-final-form";

import type { GQLEmailCampaignTargetGroupOptionFragment } from "./EmailCampaignSendingTab.gql.generated";

export interface EmailCampaignFormValues {
    title: string;
    subject: string;
    targetGroups: GQLEmailCampaignTargetGroupOptionFragment[];
    /** An ISO 8601 date-time. Only saved while the campaign has target groups. */
    scheduledAt: string | null;
    content: BlockState<BlockInterface>;
}

const noSubscription = {};

function haveSameIds(first?: Array<{ id: string }>, second?: Array<{ id: string }>) {
    return (first ?? []).map((item) => item.id).join() === (second ?? []).map((item) => item.id).join();
}

/**
 * Keeps all fields of the campaign registered while the editor is open, as each tab only renders its own fields and React Final Form
 * leaves fields that aren't registered out of `dirty`.
 */
export function useRegisterEmailCampaignFields() {
    useField<EmailCampaignFormValues["title"]>("title", { subscription: noSubscription });
    useField<EmailCampaignFormValues["subject"]>("subject", { subscription: noSubscription });
    useField<EmailCampaignFormValues["targetGroups"]>("targetGroups", { subscription: noSubscription, isEqual: haveSameIds });
    useField<EmailCampaignFormValues["scheduledAt"]>("scheduledAt", { subscription: noSubscription });
    useField<EmailCampaignFormValues["content"]>("content", { subscription: noSubscription, isEqual: deepEqual });
}
