import { AnchorBlock, createBlocksBlock, DamImageBlock } from "@dextinity/serverless/server";

import { AccordionBlock } from "../../../common/blocks/accordion.block";
import { LayoutBlock } from "../../../common/blocks/layout.block";
import { MediaGalleryBlock } from "../../../common/blocks/media-gallery.block";
import { PageTreeIndexBlock } from "../../../common/blocks/page-tree-index.block";
import { SpaceBlock } from "../../../common/blocks/space.block";
import {
    StandaloneCallToActionListBlock,
    StandaloneHeadingBlock,
    StandaloneMediaBlock,
    StandaloneRichTextBlock,
} from "../../../common/blocks/standalone-blocks.block";
import { TableBlock } from "../../../common/blocks/table.block";
import { TextImageBlock } from "../../../common/blocks/text-image.block";
import { BillboardTeaserBlock } from "./billboard-teaser.block";
import { ColumnsBlock } from "./columns.block";
import { ContentGroupBlock } from "./content-group.block";
import { FullWidthImageBlock } from "./full-width-image.block";
import { KeyFactsBlock } from "./key-facts.block";
import { SliderBlock } from "./slider.block";
import { TeaserBlock } from "./teaser.block";

export const PageContentBlock = createBlocksBlock({
    name: "PageContent",
    supportedBlocks: {
        accordion: AccordionBlock,
        anchor: AnchorBlock,
        billboardTeaser: BillboardTeaserBlock,
        space: SpaceBlock,
        teaser: TeaserBlock,
        richtext: StandaloneRichTextBlock,
        heading: StandaloneHeadingBlock,
        columns: ColumnsBlock,
        callToActionList: StandaloneCallToActionListBlock,
        keyFacts: KeyFactsBlock,
        media: StandaloneMediaBlock,
        contentGroup: ContentGroupBlock,
        mediaGallery: MediaGalleryBlock,
        slider: SliderBlock,
        image: DamImageBlock,
        layout: LayoutBlock,
        textImage: TextImageBlock,
        fullWidthImage: FullWidthImageBlock,
        table: TableBlock,
        pageTreeIndex: PageTreeIndexBlock,
    },
});
