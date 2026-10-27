import { AnchorBlock, createBlock, createBlocksBlock } from "@dextinity/serverless/server";
import { z } from "zod";

import { AccordionBlock } from "../../../common/blocks/accordion.block";
import { MediaGalleryBlock } from "../../../common/blocks/media-gallery.block";
import { SpaceBlock } from "../../../common/blocks/space.block";
import {
    StandaloneCallToActionListBlock,
    StandaloneHeadingBlock,
    StandaloneMediaBlock,
    StandaloneRichTextBlock,
} from "../../../common/blocks/standalone-blocks.block";
import { TableBlock } from "../../../common/blocks/table.block";
import { ColumnsBlock } from "./columns.block";
import { KeyFactsBlock } from "./key-facts.block";
import { TeaserBlock } from "./teaser.block";

const ContentGroupContentBlock = createBlocksBlock({
    name: "ContentGroupContent",
    supportedBlocks: {
        accordion: AccordionBlock,
        anchor: AnchorBlock,
        space: SpaceBlock,
        teaser: TeaserBlock,
        richtext: StandaloneRichTextBlock,
        heading: StandaloneHeadingBlock,
        columns: ColumnsBlock,
        callToActionList: StandaloneCallToActionListBlock,
        keyFacts: KeyFactsBlock,
        media: StandaloneMediaBlock,
        mediaGallery: MediaGalleryBlock,
        table: TableBlock,
    },
});

export const ContentGroupBlock = createBlock(
    "ContentGroup",
    z.strictObject({ backgroundColor: z.enum(["default", "lightGray", "darkGray"]), content: ContentGroupContentBlock.schema }),
);
