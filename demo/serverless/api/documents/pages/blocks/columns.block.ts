import { AnchorBlock, createBlocksBlock, createColumnsBlock } from "@dextinity/serverless/server";

import { columnsLayouts } from "../../../../shared/blocks";
import { AccordionBlock } from "../../../common/blocks/accordion.block";
import { MediaGalleryBlock } from "../../../common/blocks/media-gallery.block";
import { SpaceBlock } from "../../../common/blocks/space.block";
import {
    StandaloneCallToActionListBlock,
    StandaloneHeadingBlock,
    StandaloneMediaBlock,
    StandaloneRichTextBlock,
} from "../../../common/blocks/standalone-blocks.block";
import { TextImageBlock } from "../../../common/blocks/text-image.block";

const ColumnsContentBlock = createBlocksBlock({
    name: "ColumnsContent",
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
});

export const ColumnsBlock = createColumnsBlock({ name: "Columns", layouts: [...columnsLayouts], contentBlock: ColumnsContentBlock });
