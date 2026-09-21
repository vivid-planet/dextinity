import { createBlocksBlock } from "@dextinity/cms-admin";
import { MailButtonBlock } from "@src/mail/blocks/MailButtonBlock";
import { MailDividerBlock } from "@src/mail/blocks/MailDividerBlock";
import { MailImageBlock } from "@src/mail/blocks/MailImageBlock";
import { MailRichTextBlock } from "@src/mail/blocks/MailRichTextBlock";
import { MailSpacerBlock } from "@src/mail/blocks/MailSpacerBlock";
import { MailTwoListSizesRichTextBlock } from "@src/mail/blocks/MailTwoListSizesRichTextBlock";

export const WelcomeEmailContentBlock = createBlocksBlock({
    name: "WelcomeEmailContent",
    supportedBlocks: {
        text: MailRichTextBlock,
        twoListSizesText: MailTwoListSizesRichTextBlock,
        image: MailImageBlock,
        button: MailButtonBlock,
        divider: MailDividerBlock,
        spacer: MailSpacerBlock,
    },
});
