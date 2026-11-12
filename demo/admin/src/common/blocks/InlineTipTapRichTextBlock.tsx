import { createTipTapRichTextBlock } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

export const InlineTipTapRichTextBlock = {
    ...createTipTapRichTextBlock({
        strike: false,
        textBlocks: [
            {
                name: "paragraph",
                tag: "p",
                label: <FormattedMessage id="inlineTipTapRichTextBlock.textBlock.paragraph" defaultMessage="Paragraph" />,
            },
        ],
        orderedList: false,
        unorderedList: false,
        maxTextBlocks: 1,
        minHeight: 0,
    }),
    name: "InlineTipTapRichText",
};
