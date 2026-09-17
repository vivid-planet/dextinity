import { createTipTapRichTextBlock, typeSafeBlockMigrationPipe } from "@dextinity/cms-api";
import { ProductPriceBlock } from "@src/products/blocks/product-price.block";
import { ProductTeaserBlock } from "@src/products/blocks/product-teaser.block";

import { LinkBlock } from "./link.block";
import { Heading1ToHeading2Migration } from "./tip-tap-rich-text/migrations/2-heading-1-to-heading-2.migration";

export const TipTapRichTextBlock = createTipTapRichTextBlock(
    {
        link: LinkBlock,
        childBlocks: {
            productPrice: { block: ProductPriceBlock, display: "inline" },
            productTeaser: { block: ProductTeaserBlock, display: "block" },
        },
        textBlocks: [
            {
                name: "paragraph",
                tag: "paragraph",
                styles: ["paragraph300", "paragraph200", "eyebrow600", "eyebrow550", "eyebrow500", "eyebrow450"],
            },
            { name: "heading-1", tag: "heading-1" },
            { name: "heading-2", tag: "heading-2" },
            { name: "heading-3", tag: "heading-3" },
            { name: "heading-4", tag: "heading-4" },
            { name: "heading-5", tag: "heading-5" },
            { name: "heading-6", tag: "heading-6" },
        ],
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
        listStyles: ["list300", "list200"],
        inlineStyles: [{ name: "highlight" }, { name: "tag", appliesTo: ["paragraph"] }],
        migrateFromDraftJs: {
            // Map the DraftJS `blocktypeMap` entry `paragraph-small` (configured in the admin RichTextBlock)
            // to the equivalent TipTap textBlockStyle so legacy content keeps its smaller paragraph variant.
            textBlockMap: { "paragraph-small": "paragraph200" },
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
