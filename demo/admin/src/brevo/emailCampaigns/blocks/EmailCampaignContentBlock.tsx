import { createBlocksBlock } from "@dextinity/cms-admin";
import { MailButtonBlock } from "@src/mail/blocks/MailButtonBlock";
import { MailDividerBlock } from "@src/mail/blocks/MailDividerBlock";
import { MailHeadingBlock } from "@src/mail/blocks/MailHeadingBlock";
import { MailImageBlock } from "@src/mail/blocks/MailImageBlock";
import { MailSpacerBlock } from "@src/mail/blocks/MailSpacerBlock";
import { MailTwoListSizesRichTextBlock } from "@src/mail/blocks/MailTwoListSizesRichTextBlock";

import { EmailCampaignRichTextBlock } from "./EmailCampaignRichTextBlock";
import { EmailCampaignSalutationBlock } from "./EmailCampaignSalutationBlock";

export const EmailCampaignContentBlock = createBlocksBlock({
    name: "EmailCampaignContent",
    supportedBlocks: {
        heading: MailHeadingBlock,
        text: EmailCampaignRichTextBlock,
        twoListSizesText: MailTwoListSizesRichTextBlock,
        image: MailImageBlock,
        button: MailButtonBlock,
        divider: MailDividerBlock,
        spacer: MailSpacerBlock,
        salutation: EmailCampaignSalutationBlock,
    },
});
