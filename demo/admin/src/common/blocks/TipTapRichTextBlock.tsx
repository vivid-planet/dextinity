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
    textBlockStyles: [
        {
            name: "paragraph300",
            label: <FormattedMessage id="tipTapRichTextBlock.paragraph300" defaultMessage="Paragraph" />,
            appliesTo: ["paragraph"],
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 18, lineHeight: "26px" }} {...props} />,
        },
        {
            name: "paragraph200",
            label: <FormattedMessage id="tipTapRichTextBlock.paragraph200" defaultMessage="Paragraph Small" />,
            appliesTo: ["paragraph"],
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 15, lineHeight: "22px" }} {...props} />,
        },
        {
            name: "eyebrow600",
            label: <FormattedMessage id="tipTapRichTextBlock.eyebrow600" defaultMessage="Eyebrow 600" />,
            appliesTo: ["paragraph"],
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 30, lineHeight: "30px" }} {...props} />,
        },
        {
            name: "eyebrow550",
            label: <FormattedMessage id="tipTapRichTextBlock.eyebrow550" defaultMessage="Eyebrow 550" />,
            appliesTo: ["paragraph"],
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 26, lineHeight: "26px" }} {...props} />,
        },
        {
            name: "eyebrow500",
            label: <FormattedMessage id="tipTapRichTextBlock.eyebrow500" defaultMessage="Eyebrow 500" />,
            appliesTo: ["paragraph"],
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 22, lineHeight: "22px" }} {...props} />,
        },
        {
            name: "eyebrow450",
            label: <FormattedMessage id="tipTapRichTextBlock.eyebrow450" defaultMessage="Eyebrow 450" />,
            appliesTo: ["paragraph"],
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 18, lineHeight: "18px" }} {...props} />,
        },
        {
            name: "list300",
            label: <FormattedMessage id="tipTapRichTextBlock.list300" defaultMessage="List" />,
            appliesTo: ["ordered-list", "unordered-list"],
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 18, lineHeight: "26px" }} {...props} />,
        },
        {
            name: "list200",
            label: <FormattedMessage id="tipTapRichTextBlock.list200" defaultMessage="List Small" />,
            appliesTo: ["ordered-list", "unordered-list"],
            element: (props: HTMLAttributes<HTMLElement>) => <p style={{ fontSize: 15, lineHeight: "22px" }} {...props} />,
        },
    ],
    inlineStyles: [
        {
            name: "highlight",
            label: <FormattedMessage id="tipTapRichTextBlock.inlineStyle.highlight" defaultMessage="Highlight" />,
            element: (props: HTMLAttributes<HTMLElement>) => <span style={{ backgroundColor: "#fff3cd", padding: "0 2px" }} {...props} />,
        },
        {
            name: "tag",
            label: <FormattedMessage id="tipTapRichTextBlock.inlineStyle.tag" defaultMessage="Tag" />,
            appliesTo: ["paragraph"],
            element: (props: HTMLAttributes<HTMLElement>) => (
                <span style={{ backgroundColor: "#e0f0ff", color: "#0066cc", padding: "0 4px", borderRadius: 4 }} {...props} />
            ),
        },
    ],
});
