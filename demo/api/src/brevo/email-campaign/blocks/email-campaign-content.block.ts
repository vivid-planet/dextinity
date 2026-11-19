import { createBlocksBlock } from "@dextinity/cms-api";
import { MailButtonBlock } from "@src/mail/blocks/mail-button.block";
import { MailDividerBlock } from "@src/mail/blocks/mail-divider.block";
import { MailHeadingBlock } from "@src/mail/blocks/mail-heading.block";
import { MailImageBlock } from "@src/mail/blocks/mail-image.block";
import { MailSpacerBlock } from "@src/mail/blocks/mail-spacer.block";
import { MailTwoListSizesRichTextBlock } from "@src/mail/blocks/mail-two-list-sizes-rich-text.block";

import { EmailCampaignRichTextBlock } from "./email-campaign-rich-text.block";
import { EmailCampaignSalutationBlock } from "./email-campaign-salutation.block";

export const EmailCampaignContentBlock = createBlocksBlock(
    {
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
    },
    {
        name: "EmailCampaignContent",
    },
);
