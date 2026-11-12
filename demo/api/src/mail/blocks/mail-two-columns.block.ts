import { ColumnsBlockFactory, createBlocksBlock, PixelImageBlock } from "@dextinity/cms-api";
import { MailButtonBlock } from "@src/mail/blocks/mail-button.block.js";
import { MailSpacerBlock } from "@src/mail/blocks/mail-spacer.block.js";
import { MailTipTapRichTextBlock } from "@src/mail/blocks/mail-tip-tap-rich-text.block.js";

const MailTwoColumnsContentBlock = createBlocksBlock(
    {
        supportedBlocks: {
            text: MailTipTapRichTextBlock,
            image: PixelImageBlock,
            button: MailButtonBlock,
            spacer: MailSpacerBlock,
        },
    },
    "MailTwoColumnsContent",
);

export const MailTwoColumnsBlock = ColumnsBlockFactory.create(
    {
        layouts: [{ name: "1-1" }],
        contentBlock: MailTwoColumnsContentBlock,
    },
    "MailTwoColumns",
);
