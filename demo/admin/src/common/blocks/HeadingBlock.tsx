import { BlockCategory, createCompositeBlock } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

import { EyebrowRichTextBlock } from "./EyebrowRichTextBlock";
import { HeadlineRichTextBlock } from "./HeadlineRichTextBlock";

export const HeadingBlock = createCompositeBlock(
    {
        name: "Heading",
        displayName: <FormattedMessage id="headingBlock.displayName" defaultMessage="Heading" />,
        blocks: {
            eyebrow: {
                block: EyebrowRichTextBlock,
                title: <FormattedMessage id="headingBlock.eyebrow" defaultMessage="Eyebrow" />,
            },
            headline: {
                block: HeadlineRichTextBlock,
                title: <FormattedMessage id="headingBlock.title" defaultMessage="Headline" />,
            },
        },
    },
    (block) => {
        block.category = BlockCategory.TextAndContent;
        return block;
    },
);
