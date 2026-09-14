import { BlockCategory, createCompositeBlock, createCompositeBlockSelectField, createRichTextBlock } from "@dextinity/cms-admin";
import type { HeadingBlockData } from "@src/blocks.generated";
import { FormattedMessage } from "react-intl";

import { LinkBlock } from "./LinkBlock";

const EyebrowRichTextBlock = createRichTextBlock({
    link: LinkBlock,
    rte: {
        maxBlocks: 1,
        supports: ["bold", "italic", "sub", "sup", "non-breaking-space", "soft-hyphen"],
    },
    minHeight: 0,
});

const HeadlineRichTextBlock = createRichTextBlock({
    link: LinkBlock,
    rte: {
        maxBlocks: 1,
        supports: [
            "header-one",
            "header-two",
            "header-three",
            "header-four",
            "header-five",
            "header-six",
            "bold",
            "italic",
            "sub",
            "sup",
            "non-breaking-space",
            "soft-hyphen",
        ],
        standardBlockType: "header-one",
        blocktypeMap: {
            "header-one": {
                label: <FormattedMessage id="headingBlock.size600" defaultMessage="Size 600" />,
            },
            "header-two": {
                label: <FormattedMessage id="headingBlock.size550" defaultMessage="Size 550" />,
            },
            "header-three": {
                label: <FormattedMessage id="headingBlock.size500" defaultMessage="Size 500" />,
            },
            "header-four": {
                label: <FormattedMessage id="headingBlock.size450" defaultMessage="Size 450" />,
            },
            "header-five": {
                label: <FormattedMessage id="headingBlock.size400" defaultMessage="Size 400" />,
            },
            "header-six": {
                label: <FormattedMessage id="headingBlock.size350" defaultMessage="Size 350" />,
            },
        },
    },
    minHeight: 0,
});

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
