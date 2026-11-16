import { RteHighlight, Tag } from "@dextinity/admin-icons";
import { createTipTapRichTextBlock, type TipTapTextBlockStyle } from "@dextinity/cms-admin";
import { Box, Typography } from "@mui/material";
import { ProductPriceBlock } from "@src/products/blocks/ProductPriceBlock";
import { ProductTeaserBlock } from "@src/products/blocks/ProductTeaserBlock";
import type { HTMLAttributes } from "react";
import { FormattedMessage } from "react-intl";

import { LinkBlock } from "./LinkBlock";

// Typography resets the margins; keep the browser's default paragraph spacing the editor had with a plain <p>.
function textStyleSx(fontSize: number, lineHeight: number) {
    return { fontSize, lineHeight: `${lineHeight}px`, marginBlock: "1em" };
}

// Shared by both list types, so a list item's content offers the same styles either way.
const listStyles: TipTapTextBlockStyle[] = [
    {
        name: "list300",
        label: <FormattedMessage id="richTextBlock.list300" defaultMessage="List" />,
        element: (props) => <Typography sx={textStyleSx(18, 26)} {...props} />,
    },
    {
        name: "list200",
        label: <FormattedMessage id="richTextBlock.list200" defaultMessage="List Small" />,
        element: (props) => <Typography sx={textStyleSx(15, 22)} {...props} />,
    },
];

export const RichTextBlock = {
    ...createTipTapRichTextBlock({
        link: LinkBlock,
        childBlocks: {
            productPrice: { block: ProductPriceBlock, display: "inline" },
            productTeaser: { block: ProductTeaserBlock, display: "block" },
        },
        // "Display" and "Heading 1" are both stored as an h1 and told apart by the node's textBlock
        // attribute, which the site reads to pick the typography.
        textBlocks: [
            {
                name: "paragraph",
                tag: "p",
                label: <FormattedMessage id="richTextBlock.textBlock.paragraph" defaultMessage="Paragraph" />,
                styles: [
                    {
                        name: "paragraph300",
                        label: <FormattedMessage id="richTextBlock.paragraph300" defaultMessage="Paragraph" />,
                        element: (props) => <Typography sx={textStyleSx(18, 26)} {...props} />,
                    },
                    {
                        name: "paragraph200",
                        label: <FormattedMessage id="richTextBlock.paragraph200" defaultMessage="Paragraph Small" />,
                        element: (props) => <Typography sx={textStyleSx(15, 22)} {...props} />,
                    },
                    {
                        name: "eyebrow600",
                        label: <FormattedMessage id="richTextBlock.eyebrow600" defaultMessage="Eyebrow 600" />,
                        element: (props) => <Typography sx={textStyleSx(30, 30)} {...props} />,
                    },
                    {
                        name: "eyebrow550",
                        label: <FormattedMessage id="richTextBlock.eyebrow550" defaultMessage="Eyebrow 550" />,
                        element: (props) => <Typography sx={textStyleSx(26, 26)} {...props} />,
                    },
                    {
                        name: "eyebrow500",
                        label: <FormattedMessage id="richTextBlock.eyebrow500" defaultMessage="Eyebrow 500" />,
                        element: (props) => <Typography sx={textStyleSx(22, 22)} {...props} />,
                    },
                    {
                        name: "eyebrow450",
                        label: <FormattedMessage id="richTextBlock.eyebrow450" defaultMessage="Eyebrow 450" />,
                        element: (props) => <Typography sx={textStyleSx(18, 18)} {...props} />,
                    },
                ],
                defaultStyle: "paragraph300",
            },
            { name: "display", tag: "h1", label: <FormattedMessage id="richTextBlock.textBlock.display" defaultMessage="Display" /> },
            { name: "heading-1", tag: "h1", label: <FormattedMessage id="richTextBlock.textBlock.heading1" defaultMessage="Heading 1" /> },
            { name: "heading-2", tag: "h2", label: <FormattedMessage id="richTextBlock.textBlock.heading2" defaultMessage="Heading 2" /> },
            { name: "heading-3", tag: "h3", label: <FormattedMessage id="richTextBlock.textBlock.heading3" defaultMessage="Heading 3" /> },
            { name: "heading-4", tag: "h4", label: <FormattedMessage id="richTextBlock.textBlock.heading4" defaultMessage="Heading 4" /> },
            { name: "heading-5", tag: "h5", label: <FormattedMessage id="richTextBlock.textBlock.heading5" defaultMessage="Heading 5" /> },
        ],
        orderedList: { styles: listStyles, defaultStyle: "list300" },
        unorderedList: { styles: listStyles, defaultStyle: "list300" },
        inlineStyles: [
            {
                name: "highlight",
                label: <FormattedMessage id="richTextBlock.inlineStyle.highlight" defaultMessage="Highlight" />,
                icon: RteHighlight,
                element: (props: HTMLAttributes<HTMLElement>) => (
                    <Box component="span" sx={{ backgroundColor: "#fff3cd", padding: "0 2px" }} {...props} />
                ),
            },
            {
                name: "tag",
                label: <FormattedMessage id="richTextBlock.inlineStyle.tag" defaultMessage="Tag" />,
                appliesTo: ["paragraph"],
                icon: Tag,
                element: (props: HTMLAttributes<HTMLElement>) => (
                    <Box component="span" sx={{ backgroundColor: "#e0f0ff", color: "#0066cc", padding: "0 4px", borderRadius: "4px" }} {...props} />
                ),
            },
        ],
    }),
    name: "RichText",
    displayName: <FormattedMessage id="richTextBlock.displayName" defaultMessage="Rich Text" />,
};
