import { AnchorBlock, ColumnsBlockFactory, createBlocksBlock } from "@dextinity/cms-api";
import { AccordionBlock } from "@src/common/blocks/accordion.block.js";
import { HeadingBlock } from "@src/common/blocks/heading.block.js";
import { MediaGalleryBlock } from "@src/common/blocks/media-gallery.block.js";
import { RichTextBlock } from "@src/common/blocks/rich-text.block.js";
import { SpaceBlock } from "@src/common/blocks/space.block.js";
import { StandaloneCallToActionListBlock } from "@src/common/blocks/standalone-call-to-action-list.block.js";
import { StandaloneMediaBlock } from "@src/common/blocks/standalone-media.block.js";
import { TextImageBlock } from "@src/common/blocks/text-image.block.js";

export const ColumnsContentBlock = createBlocksBlock(
    {
        supportedBlocks: {
            accordion: AccordionBlock,
            anchor: AnchorBlock,
            richtext: RichTextBlock,
            space: SpaceBlock,
            heading: HeadingBlock,
            callToActionList: StandaloneCallToActionListBlock,
            media: StandaloneMediaBlock,
            mediaGallery: MediaGalleryBlock,
            textImage: TextImageBlock,
        },
    },
    "ColumnsContent",
);

export const ColumnsBlock = ColumnsBlockFactory.create(
    {
        layouts: [{ name: "2-20-2" }, { name: "4-16-4" }, { name: "6-12-6" }, { name: "9-9" }, { name: "12-6" }, { name: "6-12" }],
        contentBlock: ColumnsContentBlock,
    },
    "Columns",
);
