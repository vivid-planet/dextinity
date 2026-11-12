import {
    ColumnsLayoutPreview,
    ColumnsLayoutPreviewContent,
    ColumnsLayoutPreviewSpacing,
    createBlocksBlock,
    createColumnsBlock,
    PixelImageBlock,
} from "@dextinity/cms-admin";
import { MailButtonBlock } from "@src/mail/blocks/MailButtonBlock";
import { MailSpacerBlock } from "@src/mail/blocks/MailSpacerBlock";
import { MailTipTapRichTextBlock } from "@src/mail/blocks/MailTipTapRichTextBlock";
import { FormattedMessage } from "react-intl";

const MailTwoColumnsContentBlock = createBlocksBlock({
    name: "MailTwoColumnsContent",
    supportedBlocks: {
        text: MailTipTapRichTextBlock,
        image: PixelImageBlock,
        button: MailButtonBlock,
        spacer: MailSpacerBlock,
    },
});

export const MailTwoColumnsBlock = createColumnsBlock({
    name: "MailTwoColumns",
    displayName: <FormattedMessage id="mail.twoColumnsBlock.displayName" defaultMessage="Two columns" />,
    contentBlock: MailTwoColumnsContentBlock,
    layouts: [
        {
            name: "1-1",
            columns: 2,
            label: <FormattedMessage id="mail.twoColumnsBlock.layout.sameWidth" defaultMessage="Same width" />,
            preview: (
                <ColumnsLayoutPreview>
                    <ColumnsLayoutPreviewContent width={12} />
                    <ColumnsLayoutPreviewSpacing width={1} />
                    <ColumnsLayoutPreviewContent width={12} />
                </ColumnsLayoutPreview>
            ),
        },
    ],
});
