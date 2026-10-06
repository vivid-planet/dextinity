import { createBlocksBlock } from "@dextinity/cms-api";
import { MailButtonBlock } from "@src/mail/blocks/mail-button.block.js";
import { MailDividerBlock } from "@src/mail/blocks/mail-divider.block.js";
import { MailImageBlock } from "@src/mail/blocks/mail-image.block.js";
import { MailRichTextBlock } from "@src/mail/blocks/mail-rich-text.block.js";
import { MailSpacerBlock } from "@src/mail/blocks/mail-spacer.block.js";
import { MailTwoListSizesRichTextBlock } from "@src/mail/blocks/mail-two-list-sizes-rich-text.block.js";

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
