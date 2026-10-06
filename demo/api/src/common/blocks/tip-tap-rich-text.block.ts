import { createTipTapRichTextBlock, typeSafeBlockMigrationPipe } from "@dextinity/cms-api";
import { ProductPriceBlock } from "@src/products/blocks/product-price.block.js";
import { ProductTeaserBlock } from "@src/products/blocks/product-teaser.block.js";

import { LinkBlock } from "./link.block.js";
import { Heading1ToHeading2Migration } from "./tip-tap-rich-text/migrations/2-heading-1-to-heading-2.migration.js";

export const TipTapRichTextBlock = createTipTapRichTextBlock(
    {
        link: LinkBlock,
        childBlocks: {
            productPrice: { block: ProductPriceBlock, display: "inline" },
            productTeaser: { block: ProductTeaserBlock, display: "block" },
        },
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
