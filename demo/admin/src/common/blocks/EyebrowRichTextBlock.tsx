import { createTipTapRichTextBlock } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

export const EyebrowRichTextBlock = {
    ...createTipTapRichTextBlock({
        undoRedoButtons: false,
        strike: false,
        textBlocks: [
            {
                name: "paragraph",
                tag: "p",
                label: <FormattedMessage id="eyebrowRichTextBlock.textBlock.paragraph" defaultMessage="Paragraph" />,
            },
        ],
        orderedList: false,
        unorderedList: false,
        textAlign: { left: true, center: true },
        maxTextBlocks: 1,
        minHeight: 0,
    }),
    name: "EyebrowRichText",
};
