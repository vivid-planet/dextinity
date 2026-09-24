import { RteHighlight, Tag } from "@dextinity/admin-icons";
import { createTipTapRichTextBlock } from "@dextinity/cms-admin";
import { ProductPriceBlock } from "@src/products/blocks/ProductPriceBlock";
import { ProductTeaserBlock } from "@src/products/blocks/ProductTeaserBlock";
import type { HTMLAttributes } from "react";
import { FormattedMessage } from "react-intl";

import { LinkBlock } from "./LinkBlock";

export const TipTapRichTextBlock = createTipTapRichTextBlock({
    link: LinkBlock,
    childBlocks: {
        productPrice: { block: ProductPriceBlock, display: "inline" },
        productTeaser: { block: ProductTeaserBlock, display: "block" },
    },
    // "Display" and "Heading 1" are both stored as an h1 and told apart by the node's textBlock
    // attribute, which the site reads to pick the typography.
    textBlocks: [
        { name: "paragraph", tag: "p", label: <FormattedMessage id="tipTapRichTextBlock.textBlock.paragraph" defaultMessage="Paragraph" /> },
        { name: "display", tag: "h1", label: <FormattedMessage id="tipTapRichTextBlock.textBlock.display" defaultMessage="Display" /> },
        { name: "heading-1", tag: "h1", label: <FormattedMessage id="tipTapRichTextBlock.textBlock.heading1" defaultMessage="Heading 1" /> },
        { name: "heading-2", tag: "h2", label: <FormattedMessage id="tipTapRichTextBlock.textBlock.heading2" defaultMessage="Heading 2" /> },
        { name: "heading-3", tag: "h3", label: <FormattedMessage id="tipTapRichTextBlock.textBlock.heading3" defaultMessage="Heading 3" /> },
        { name: "heading-4", tag: "h4", label: <FormattedMessage id="tipTapRichTextBlock.textBlock.heading4" defaultMessage="Heading 4" /> },
        { name: "heading-5", tag: "h5", label: <FormattedMessage id="tipTapRichTextBlock.textBlock.heading5" defaultMessage="Heading 5" /> },
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
            icon: Tag,
            element: (props: HTMLAttributes<HTMLElement>) => (
                <span style={{ backgroundColor: "#e0f0ff", color: "#0066cc", padding: "0 4px", borderRadius: 4 }} {...props} />
            ),
        },
    ],
});
