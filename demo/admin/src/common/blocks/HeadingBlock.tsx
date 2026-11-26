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
        orderedList: false,
        unorderedList: false,
        textBlocks: [{ name: "paragraph", label: <FormattedMessage id="eyebrowRichTextBlock.paragraph" defaultMessage="Paragraph" />, tag: "p" }],
        textAlign: { left: true, center: true },
        maxTextBlocks: 1,
        minHeight: 0,
    }),
    name: "EyebrowRichText",
};

const sizeStyleSx: SxProps = { fontWeight: 500, lineHeight: 1.2 };

const sizeStyles: TipTapTextBlockStyle[] = [
    {
        name: "size600",
        label: <FormattedMessage id="headlineRichTextBlock.size600" defaultMessage="Size 600" />,
        element: (props, tag) => <Typography component={tag} variant="h1" sx={sizeStyleSx} {...props} />,
    },
    {
        name: "size550",
        label: <FormattedMessage id="headlineRichTextBlock.size550" defaultMessage="Size 550" />,
        element: (props, tag) => <Typography component={tag} variant="h2" sx={sizeStyleSx} {...props} />,
    },
    {
        name: "size500",
        label: <FormattedMessage id="headlineRichTextBlock.size500" defaultMessage="Size 500" />,
        element: (props, tag) => <Typography component={tag} variant="h3" sx={sizeStyleSx} {...props} />,
    },
    {
        name: "size450",
        label: <FormattedMessage id="headlineRichTextBlock.size450" defaultMessage="Size 450" />,
        element: (props, tag) => <Typography component={tag} variant="h4" sx={sizeStyleSx} {...props} />,
    },
    {
        name: "size400",
        label: <FormattedMessage id="headlineRichTextBlock.size400" defaultMessage="Size 400" />,
        element: (props, tag) => <Typography component={tag} variant="h5" sx={sizeStyleSx} {...props} />,
    },
    {
        name: "size350",
        label: <FormattedMessage id="headlineRichTextBlock.size350" defaultMessage="Size 350" />,
        element: (props, tag) => <Typography component={tag} variant="h6" sx={sizeStyleSx} {...props} />,
    },
];

const headingTextBlocks: Array<Pick<TipTapTextBlock, "name" | "label" | "tag">> = [
    { name: "heading-1", label: <FormattedMessage id="headlineRichTextBlock.heading1" defaultMessage="Heading 1" />, tag: "h1" },
    { name: "heading-2", label: <FormattedMessage id="headlineRichTextBlock.heading2" defaultMessage="Heading 2" />, tag: "h2" },
    { name: "heading-3", label: <FormattedMessage id="headlineRichTextBlock.heading3" defaultMessage="Heading 3" />, tag: "h3" },
    { name: "heading-4", label: <FormattedMessage id="headlineRichTextBlock.heading4" defaultMessage="Heading 4" />, tag: "h4" },
    { name: "heading-5", label: <FormattedMessage id="headlineRichTextBlock.heading5" defaultMessage="Heading 5" />, tag: "h5" },
    { name: "heading-6", label: <FormattedMessage id="headlineRichTextBlock.heading6" defaultMessage="Heading 6" />, tag: "h6" },
];

const textBlocks: TipTapTextBlock[] = headingTextBlocks.map((textBlock) => ({ ...textBlock, styles: sizeStyles, defaultStyle: "size600" }));

const HeadlineRichTextBlock = {
    ...createTipTapRichTextBlock({
        undoRedoButtons: false,
        strike: false,
        orderedList: false,
        unorderedList: false,
        textBlocks,
        defaultTextBlock: "heading-2",
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
