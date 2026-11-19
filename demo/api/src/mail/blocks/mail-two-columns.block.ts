import { ColumnsBlockFactory, createBlocksBlock, PixelImageBlock } from "@dextinity/cms-api";
import { MailButtonBlock } from "@src/mail/blocks/mail-button.block";
import { MailRichTextBlock } from "@src/mail/blocks/mail-rich-text.block";
import { MailSpacerBlock } from "@src/mail/blocks/mail-spacer.block";

const MailTwoColumnsContentBlock = createBlocksBlock(
    {
        supportedBlocks: {
            text: MailRichTextBlock,
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
