import { BlockData, BlockInput, blockInputToData, createBlock } from "@dextinity/cms-api";

class EmailCampaignSalutationBlockData extends BlockData {}

class EmailCampaignSalutationBlockInput extends BlockInput {
    transformToBlockData(): EmailCampaignSalutationBlockData {
        return blockInputToData(EmailCampaignSalutationBlockData, this);
    }
}

export const EmailCampaignSalutationBlock = createBlock(EmailCampaignSalutationBlockData, EmailCampaignSalutationBlockInput, {
    name: "EmailCampaignSalutation",
    description: "The salutation of an email campaign, filled with the name of the recipient.",
});
