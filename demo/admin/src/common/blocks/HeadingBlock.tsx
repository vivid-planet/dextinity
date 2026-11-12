import { BlockCategory, createCompositeBlock, createCompositeBlockSelectField } from "@dextinity/cms-admin";
import type { HeadingBlockData } from "@src/blocks.generated";
import { FormattedMessage } from "react-intl";

import { HeadlineRichTextBlock } from "./HeadlineRichTextBlock";
import { InlineRichTextBlock } from "./InlineRichTextBlock";

export const HeadingBlock = createCompositeBlock(
    {
        name: "Heading",
        displayName: <FormattedMessage id="headingBlock.displayName" defaultMessage="Heading" />,
        blocks: {
            eyebrow: {
                block: InlineRichTextBlock,
                title: <FormattedMessage id="headingBlock.eyebrow" defaultMessage="Eyebrow" />,
            },
            headline: {
                block: HeadlineRichTextBlock,
                title: <FormattedMessage id="headingBlock.title" defaultMessage="Headline" />,
            },
            htmlTag: {
                block: createCompositeBlockSelectField<HeadingBlockData["htmlTag"]>({
                    label: <FormattedMessage id="headingBlock.htmlTag" defaultMessage="HTML tag" />,
                    defaultValue: "h2",
                    options: [
                        { value: "h1", label: <FormattedMessage id="headingBlock.headline1" defaultMessage="Headline 1" /> },
                        { value: "h2", label: <FormattedMessage id="headingBlock.headline2" defaultMessage="Headline 2" /> },
                        { value: "h3", label: <FormattedMessage id="headingBlock.headline3" defaultMessage="Headline 3" /> },
                        { value: "h4", label: <FormattedMessage id="headingBlock.headline4" defaultMessage="Headline 4" /> },
                        { value: "h5", label: <FormattedMessage id="headingBlock.headline5" defaultMessage="Headline 5" /> },
                        { value: "h6", label: <FormattedMessage id="headingBlock.headline6" defaultMessage="Headline 6" /> },
                    ],
                    required: true,
                }),
            },
        },
    },
    (block) => {
        block.category = BlockCategory.TextAndContent;
        return block;
    },
);
