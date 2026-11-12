import { createBlocksBlock } from "@dextinity/cms-admin";
import { MailButtonBlock } from "@src/mail/blocks/MailButtonBlock";
import { MailDividerBlock } from "@src/mail/blocks/MailDividerBlock";
import { MailImageBlock } from "@src/mail/blocks/MailImageBlock";
import { MailSpacerBlock } from "@src/mail/blocks/MailSpacerBlock";
import { MailTipTapRichTextBlock } from "@src/mail/blocks/MailTipTapRichTextBlock";
import { MailTwoColumnsBlock } from "@src/mail/blocks/MailTwoColumnsBlock";
import { MailTwoListSizesTipTapRichTextBlock } from "@src/mail/blocks/MailTwoListSizesTipTapRichTextBlock";

export const WelcomeEmailContentBlock = createBlocksBlock({
    name: "WelcomeEmailContent",
    supportedBlocks: {
        twoListSizesTipTapText: MailTwoListSizesTipTapRichTextBlock,
        tipTapText: MailTipTapRichTextBlock,
        image: MailImageBlock,
        button: MailButtonBlock,
        divider: MailDividerBlock,
        spacer: MailSpacerBlock,
        twoColumns: MailTwoColumnsBlock,
    },
});
