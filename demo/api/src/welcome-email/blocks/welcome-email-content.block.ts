import { createBlocksBlock } from "@dextinity/cms-api";
import { MailButtonBlock } from "@src/mail/blocks/mail-button.block";
import { MailDividerBlock } from "@src/mail/blocks/mail-divider.block";
import { MailHeadingBlock } from "@src/mail/blocks/mail-heading.block";
import { MailImageBlock } from "@src/mail/blocks/mail-image.block";
import { MailRichTextBlock } from "@src/mail/blocks/mail-rich-text.block";
import { MailSpacerBlock } from "@src/mail/blocks/mail-spacer.block";
import { MailTwoColumnsBlock } from "@src/mail/blocks/mail-two-columns.block";

export const WelcomeEmailContentBlock = createBlocksBlock(
    {
        supportedBlocks: {
            heading: MailHeadingBlock,
            text: MailRichTextBlock,
            image: MailImageBlock,
            button: MailButtonBlock,
            divider: MailDividerBlock,
            spacer: MailSpacerBlock,
            twoColumns: MailTwoColumnsBlock,
        },
    },
    {
        name: "WelcomeEmailContent",
    },
);
