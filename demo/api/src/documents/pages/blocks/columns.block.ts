import { AnchorBlock, ColumnsBlockFactory, createBlocksBlock } from "@dextinity/cms-api";
import { AccordionBlock } from "@src/common/blocks/accordion.block.js";
import { MediaGalleryBlock } from "@src/common/blocks/media-gallery.block.js";
import { SpaceBlock } from "@src/common/blocks/space.block.js";
import { StandaloneCallToActionListBlock } from "@src/common/blocks/standalone-call-to-action-list.block.js";
import { StandaloneHeadingBlock } from "@src/common/blocks/standalone-heading.block.js";
import { StandaloneMediaBlock } from "@src/common/blocks/standalone-media.block.js";
import { StandaloneRichTextBlock } from "@src/common/blocks/standalone-rich-text.block.js";
import { TextImageBlock } from "@src/common/blocks/text-image.block.js";

export const ColumnsContentBlock = createBlocksBlock(
    {
        supportedBlocks: {
            accordion: AccordionBlock,
            anchor: AnchorBlock,
            richtext: StandaloneRichTextBlock,
            space: SpaceBlock,
            heading: StandaloneHeadingBlock,
            callToActionList: StandaloneCallToActionListBlock,
            media: StandaloneMediaBlock,
            mediaGallery: MediaGalleryBlock,
            textImage: TextImageBlock,
        },
    },
    { name: "ColumnsContent" },
);

export const ColumnsBlock = ColumnsBlockFactory.create(
    {
        layouts: [{ name: "2-20-2" }, { name: "4-16-4" }, { name: "6-12-6" }, { name: "9-9" }, { name: "12-6" }, { name: "6-12" }],
        contentBlock: ColumnsContentBlock,
    },
    "Columns",
);
