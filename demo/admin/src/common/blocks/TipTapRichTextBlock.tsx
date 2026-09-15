import { RteHighlight, Tag as TagIcon } from "@dextinity/admin-icons";
import { createTipTapRichTextBlock, type TipTapTextBlock } from "@dextinity/cms-admin";
import { ProductPriceBlock } from "@src/products/blocks/ProductPriceBlock";
import { ProductTeaserBlock } from "@src/products/blocks/ProductTeaserBlock";
import type { HTMLAttributes } from "react";
import { FormattedMessage } from "react-intl";

import { LinkBlock } from "./LinkBlock";

const headingTextBlocks: TipTapTextBlock[] = ([1, 2, 3, 4, 5, 6] as const).map((level) => ({
    name: `heading-${level}`,
    tag: `h${level}`,
    label: <FormattedMessage id="tipTapRichTextBlock.textBlock.heading" defaultMessage="Heading {level}" values={{ level }} />,
}));

const listStyles = { styles: ["list300", "list200"], defaultStyle: "list300" };

export const TipTapRichTextBlock = createTipTapRichTextBlock({
    link: LinkBlock,
    childBlocks: {
        productPrice: { block: ProductPriceBlock, display: "inline" },
        productTeaser: { block: ProductTeaserBlock, display: "block" },
    },
    textBlocks: [
        {
            name: "paragraph",
            tag: "p",
            label: <FormattedMessage id="tipTapRichTextBlock.textBlock.paragraph" defaultMessage="Paragraph" />,
            styles: ["paragraph300", "paragraph200"],
            defaultStyle: "paragraph300",
        },
        {
            // A second text block with the same tag: same semantics, but its own set of styles.
            name: "eyebrow",
            tag: "p",
            label: <FormattedMessage id="tipTapRichTextBlock.textBlock.eyebrow" defaultMessage="Eyebrow" />,
            styles: ["eyebrow600", "eyebrow550", "eyebrow500", "eyebrow450"],
            defaultStyle: "eyebrow500",
        },
        ...headingTextBlocks,
    ],
    orderedList: listStyles,
    unorderedList: listStyles,
    textBlockStyles: [
        {
            name: "paragraph300",
            label: <FormattedMessage id="tipTapRichTextBlock.paragraph300" defaultMessage="Paragraph" />,
            element: (props, Tag) => <Tag style={{ fontSize: 18, lineHeight: "26px" }} {...props} />,
        },
        {
            name: "paragraph200",
            label: <FormattedMessage id="tipTapRichTextBlock.paragraph200" defaultMessage="Paragraph Small" />,
            element: (props, Tag) => <Tag style={{ fontSize: 15, lineHeight: "22px" }} {...props} />,
        },
        {
            name: "eyebrow600",
            label: <FormattedMessage id="tipTapRichTextBlock.eyebrow600" defaultMessage="Eyebrow 600" />,
            element: (props, Tag) => <Tag style={{ fontSize: 30, lineHeight: "30px" }} {...props} />,
        },
        {
            name: "eyebrow550",
            label: <FormattedMessage id="tipTapRichTextBlock.eyebrow550" defaultMessage="Eyebrow 550" />,
            element: (props, Tag) => <Tag style={{ fontSize: 26, lineHeight: "26px" }} {...props} />,
        },
        {
            name: "eyebrow500",
            label: <FormattedMessage id="tipTapRichTextBlock.eyebrow500" defaultMessage="Eyebrow 500" />,
            element: (props, Tag) => <Tag style={{ fontSize: 22, lineHeight: "22px" }} {...props} />,
        },
        {
            name: "eyebrow450",
            label: <FormattedMessage id="tipTapRichTextBlock.eyebrow450" defaultMessage="Eyebrow 450" />,
            element: (props, Tag) => <Tag style={{ fontSize: 18, lineHeight: "18px" }} {...props} />,
        },
        {
            name: "list300",
            label: <FormattedMessage id="tipTapRichTextBlock.list300" defaultMessage="List" />,
            element: (props, Tag) => <Tag style={{ fontSize: 18, lineHeight: "26px" }} {...props} />,
        },
        {
            name: "list200",
            label: <FormattedMessage id="tipTapRichTextBlock.list200" defaultMessage="List Small" />,
            element: (props, Tag) => <Tag style={{ fontSize: 15, lineHeight: "22px" }} {...props} />,
        },
    ],
    inlineStyles: [
        {
            name: "highlight",
            label: <FormattedMessage id="tipTapRichTextBlock.inlineStyle.highlight" defaultMessage="Highlight" />,
            icon: RteHighlight,
            element: (props: HTMLAttributes<HTMLElement>) => <span style={{ backgroundColor: "#fff3cd", padding: "0 2px" }} {...props} />,
        },
        {
            name: "tag",
            label: <FormattedMessage id="tipTapRichTextBlock.inlineStyle.tag" defaultMessage="Tag" />,
            appliesTo: ["paragraph"],
            icon: TagIcon,
            element: (props: HTMLAttributes<HTMLElement>) => (
                <span style={{ backgroundColor: "#e0f0ff", color: "#0066cc", padding: "0 4px", borderRadius: 4 }} {...props} />
            ),
        },
    ],
});
