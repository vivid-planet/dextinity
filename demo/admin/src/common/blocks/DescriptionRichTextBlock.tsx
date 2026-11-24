import { createTipTapRichTextBlock } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

export const DescriptionRichTextBlock = {
    ...createTipTapRichTextBlock({
        undoRedoButtons: false,
        strike: false,
        textBlocks: [
            {
                name: "paragraph",
                tag: "p",
                label: <FormattedMessage id="descriptionRichTextBlock.textBlock.paragraph" defaultMessage="Paragraph" />,
            },
        ],
        orderedList: false,
        unorderedList: false,
        maxTextBlocks: 1,
        minHeight: 0,
    }),
    name: "DescriptionRichText",
};
