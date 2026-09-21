import { createBlocksBlock } from "@dextinity/cms-api";
import { MailButtonBlock } from "@src/mail/blocks/mail-button.block";
import { MailDividerBlock } from "@src/mail/blocks/mail-divider.block";
import { MailImageBlock } from "@src/mail/blocks/mail-image.block";
import { MailRichTextBlock } from "@src/mail/blocks/mail-rich-text.block";
import { MailSpacerBlock } from "@src/mail/blocks/mail-spacer.block";
import { MailTwoListSizesRichTextBlock } from "@src/mail/blocks/mail-two-list-sizes-rich-text.block";

export const WelcomeEmailContentBlock = createBlocksBlock(
    {
        supportedBlocks: {
            text: MailRichTextBlock,
            twoListSizesText: MailTwoListSizesRichTextBlock,
            image: MailImageBlock,
            button: MailButtonBlock,
            divider: MailDividerBlock,
            spacer: MailSpacerBlock,
        },
    },
    {
        name: "WelcomeEmailContent",
    },
);
