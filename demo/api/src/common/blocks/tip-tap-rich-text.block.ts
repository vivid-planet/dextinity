import { createTipTapRichTextBlock, typeSafeBlockMigrationPipe } from "@dextinity/cms-api";
import { ProductPriceBlock } from "@src/products/blocks/product-price.block";
import { ProductTeaserBlock } from "@src/products/blocks/product-teaser.block";

import { LinkBlock } from "./link.block";
import { Heading1ToHeading2Migration } from "./tip-tap-rich-text/migrations/2-heading-1-to-heading-2.migration";

const listStyles = { styles: ["list300", "list200"], defaultStyle: "list300" };

export const TipTapRichTextBlock = createTipTapRichTextBlock(
    {
        link: LinkBlock,
        childBlocks: {
            productPrice: { block: ProductPriceBlock, display: "inline" },
            productTeaser: { block: ProductTeaserBlock, display: "block" },
        },
        textBlocks: [
            { name: "paragraph", tag: "p", styles: ["paragraph300", "paragraph200"], defaultStyle: "paragraph300" },
            // A second text block with the same tag: same semantics, but its own set of styles.
            { name: "eyebrow", tag: "p", styles: ["eyebrow600", "eyebrow550", "eyebrow500", "eyebrow450"], defaultStyle: "eyebrow500" },
            { name: "heading-1", tag: "h1" },
            { name: "heading-2", tag: "h2" },
            { name: "heading-3", tag: "h3" },
            { name: "heading-4", tag: "h4" },
            { name: "heading-5", tag: "h5" },
            { name: "heading-6", tag: "h6" },
        ],
        orderedList: listStyles,
        unorderedList: listStyles,
        textBlockStyles: [
            { name: "paragraph300" },
            { name: "paragraph200" },
            { name: "eyebrow600" },
            { name: "eyebrow550" },
            { name: "eyebrow500" },
            { name: "eyebrow450" },
            { name: "list300" },
            { name: "list200" },
        ],
        inlineStyles: [{ name: "highlight" }, { name: "tag", appliesTo: ["paragraph"] }],
        migrateFromDraftJs: {
            // Map the DraftJS `blocktypeMap` entry `paragraph-small` (configured in the admin RichTextBlock)
            // to the equivalent TipTap textBlockStyle so legacy content keeps its smaller paragraph variant.
            textBlockStyleMap: { "paragraph-small": "paragraph200" },
        },
    },
    {
        name: "TipTapRichText",
        migrate: {
            migrations: typeSafeBlockMigrationPipe([Heading1ToHeading2Migration]),
            version: 2,
        },
    },
);
