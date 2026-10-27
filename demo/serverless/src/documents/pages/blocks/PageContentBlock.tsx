import { AnchorBlock, createBlocksBlock } from "@dextinity/cms-admin";
import { DamImageBlock } from "@dextinity/serverless/client";

import { AccordionBlock } from "../../../common/blocks/AccordionBlock";
import { LayoutBlock } from "../../../common/blocks/LayoutBlock";
import { MediaGalleryBlock } from "../../../common/blocks/MediaGalleryBlock";
import { PageTreeIndexBlock } from "../../../common/blocks/PageTreeIndexBlock";
import { SpaceBlock } from "../../../common/blocks/SpaceBlock";
import { StandaloneCallToActionListBlock } from "../../../common/blocks/StandaloneCallToActionListBlock";
import { StandaloneHeadingBlock } from "../../../common/blocks/StandaloneHeadingBlock";
import { StandaloneMediaBlock } from "../../../common/blocks/StandaloneMediaBlock";
import { StandaloneRichTextBlock } from "../../../common/blocks/StandaloneRichTextBlock";
import { TableBlock } from "../../../common/blocks/TableBlock";
import { TextImageBlock } from "../../../common/blocks/TextImageBlock";
import { BillboardTeaserBlock } from "./BillboardTeaserBlock";
import { ColumnsBlock } from "./ColumnsBlock";
import { ContentGroupBlock } from "./ContentGroupBlock";
import { FullWidthImageBlock } from "./FullWidthImageBlock";
import { KeyFactsBlock } from "./KeyFactsBlock";
import { SliderBlock } from "./SliderBlock";
import { TeaserBlock } from "./TeaserBlock";

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
