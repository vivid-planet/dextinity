import { createBlocksBlock } from "@dextinity/cms-admin";
import { MailButtonBlock } from "@src/mail/blocks/MailButtonBlock";
import { MailDividerBlock } from "@src/mail/blocks/MailDividerBlock";
import { MailImageBlock } from "@src/mail/blocks/MailImageBlock";
import { MailSpacerBlock } from "@src/mail/blocks/MailSpacerBlock";
import { MailTwoListSizesTipTapRichTextBlock } from "@src/mail/blocks/MailTwoListSizesTipTapRichTextBlock";

import { EmailCampaignSalutationBlock } from "./EmailCampaignSalutationBlock";
import { EmailCampaignTipTapRichTextBlock } from "./EmailCampaignTipTapRichTextBlock";

export const EmailCampaignContentBlock = createBlocksBlock({
    name: "EmailCampaignContent",
    supportedBlocks: {
        twoListSizesTipTapText: MailTwoListSizesTipTapRichTextBlock,
        tipTapText: EmailCampaignTipTapRichTextBlock,
        image: MailImageBlock,
        button: MailButtonBlock,
        divider: MailDividerBlock,
        spacer: MailSpacerBlock,
        salutation: EmailCampaignSalutationBlock,
    },
});
