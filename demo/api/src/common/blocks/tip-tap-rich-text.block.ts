import { createTipTapRichTextBlock, typeSafeBlockMigrationPipe } from "@dextinity/cms-api";
import { ProductPriceBlock } from "@src/products/blocks/product-price.block";
import { ProductTeaserBlock } from "@src/products/blocks/product-teaser.block";

import { LinkBlock } from "./link.block";
import { Heading1ToHeading2Migration } from "./tip-tap-rich-text/migrations/1-heading-1-to-heading-2.migration";

export const TipTapRichTextBlock = createTipTapRichTextBlock(
    {
        link: LinkBlock,
        childBlocks: {
            productPrice: { block: ProductPriceBlock, display: "inline" },
            productTeaser: { block: ProductTeaserBlock, display: "block" },
        },
        // "Display" and "Heading 1" are both stored as an h1 and told apart by the node's textBlock
        // attribute, which the site reads to pick the typography.
        textBlocks: [
            { name: "paragraph", tag: "p" },
            { name: "display", tag: "h1" },
            { name: "heading-1", tag: "h1" },
            { name: "heading-2", tag: "h2" },
            { name: "heading-3", tag: "h3" },
            { name: "heading-4", tag: "h4" },
            { name: "heading-5", tag: "h5" },
        ],
        textBlockStyles: [
            { name: "paragraph300", appliesTo: ["paragraph"] },
            { name: "paragraph200", appliesTo: ["paragraph"] },
            { name: "eyebrow600", appliesTo: ["paragraph"] },
            { name: "eyebrow550", appliesTo: ["paragraph"] },
            { name: "eyebrow500", appliesTo: ["paragraph"] },
            { name: "eyebrow450", appliesTo: ["paragraph"] },
            { name: "list300", appliesTo: ["ordered-list", "unordered-list"] },
            { name: "list200", appliesTo: ["ordered-list", "unordered-list"] },
        ],
        inlineStyles: [{ name: "highlight" }, { name: "tag", appliesTo: ["paragraph"] }],
        migrateFromDraftJs: {
            textBlockMap: {
                // The DraftJS `blocktypeMap` entry `paragraph-small` (configured in the admin RichTextBlock)
                // maps to the equivalent TipTap textBlockStyle, so legacy content keeps its smaller paragraph variant.
                "paragraph-small": { textBlock: "paragraph", textBlockStyle: "paragraph200" },
                // "Display" and "Heading 1" are both stored as an h1, so the conversion has to be told
                // which of them a DraftJS heading becomes.
                "header-one": { textBlock: "heading-1" },
            },
        },
    },
    {
        name: "TipTapRichText",
        migrate: {
            migrations: typeSafeBlockMigrationPipe([Heading1ToHeading2Migration]),
            version: 1,
        },
    },
);
