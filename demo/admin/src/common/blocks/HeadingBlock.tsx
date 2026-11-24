import {
    BlockCategory,
    createCompositeBlock,
    createTipTapRichTextBlock,
    type TipTapTextBlock,
    type TipTapTextBlockStyle,
} from "@dextinity/cms-admin";
import { type SxProps, Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";

const EyebrowRichTextBlock = {
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

const sizeSx: SxProps = { fontWeight: 500, lineHeight: 1.2 };

const sizeStyles: TipTapTextBlockStyle[] = [
    {
        name: "headline600",
        label: <FormattedMessage id="headingBlock.size600" defaultMessage="Size 600" />,
        element: (props, tag) => <Typography component={tag} variant="h1" sx={sizeSx} {...props} />,
    },
    {
        name: "headline550",
        label: <FormattedMessage id="headingBlock.size550" defaultMessage="Size 550" />,
        element: (props, tag) => <Typography component={tag} variant="h2" sx={sizeSx} {...props} />,
    },
    {
        name: "headline500",
        label: <FormattedMessage id="headingBlock.size500" defaultMessage="Size 500" />,
        element: (props, tag) => <Typography component={tag} variant="h3" sx={sizeSx} {...props} />,
    },
    {
        name: "headline450",
        label: <FormattedMessage id="headingBlock.size450" defaultMessage="Size 450" />,
        element: (props, tag) => <Typography component={tag} variant="h4" sx={sizeSx} {...props} />,
    },
    {
        name: "headline400",
        label: <FormattedMessage id="headingBlock.size400" defaultMessage="Size 400" />,
        element: (props, tag) => <Typography component={tag} variant="h5" sx={sizeSx} {...props} />,
    },
    {
        name: "headline350",
        label: <FormattedMessage id="headingBlock.size350" defaultMessage="Size 350" />,
        element: (props, tag) => <Typography component={tag} variant="h6" sx={sizeSx} {...props} />,
    },
];

const headingTextBlocks: Array<Pick<TipTapTextBlock, "name" | "label" | "tag">> = [
    { name: "heading-1", tag: "h1", label: <FormattedMessage id="headingBlock.heading1" defaultMessage="Heading 1" /> },
    { name: "heading-2", tag: "h2", label: <FormattedMessage id="headingBlock.heading2" defaultMessage="Heading 2" /> },
    { name: "heading-3", tag: "h3", label: <FormattedMessage id="headingBlock.heading3" defaultMessage="Heading 3" /> },
    { name: "heading-4", tag: "h4", label: <FormattedMessage id="headingBlock.heading4" defaultMessage="Heading 4" /> },
    { name: "heading-5", tag: "h5", label: <FormattedMessage id="headingBlock.heading5" defaultMessage="Heading 5" /> },
    { name: "heading-6", tag: "h6", label: <FormattedMessage id="headingBlock.heading6" defaultMessage="Heading 6" /> },
];

// The text block sets the headline's HTML tag, the style its size, so both can be chosen independently.
const textBlocks: TipTapTextBlock[] = headingTextBlocks.map((textBlock) => ({ ...textBlock, styles: sizeStyles, defaultStyle: "headline600" }));

const HeadlineRichTextBlock = {
    ...createTipTapRichTextBlock({
        undoRedoButtons: false,
        strike: false,
        textBlocks,
        defaultTextBlock: "heading-2",
        orderedList: false,
        unorderedList: false,
        textAlign: { left: true, center: true },
        maxTextBlocks: 1,
        minHeight: 0,
    }),
    name: "HeadlineRichText",
};

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
