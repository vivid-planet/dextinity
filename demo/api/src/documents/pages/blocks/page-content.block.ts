import { AnchorBlock, BaseBlocksBlockItemData, BaseBlocksBlockItemInput, BlockField, createBlocksBlock, DamImageBlock } from "@dextinity/cms-api";
import { AccordionBlock } from "@src/common/blocks/accordion.block.js";
import { ContactFormBlock } from "@src/common/blocks/contact-form.block.js";
import { MediaGalleryBlock } from "@src/common/blocks/media-gallery.block.js";
import { PageTreeIndexBlock } from "@src/common/blocks/page-tree-index.block.js";
import { SpaceBlock } from "@src/common/blocks/space.block.js";
import { StandaloneCallToActionListBlock } from "@src/common/blocks/standalone-call-to-action-list.block.js";
import { StandaloneHeadingBlock } from "@src/common/blocks/standalone-heading.block.js";
import { StandaloneMediaBlock } from "@src/common/blocks/standalone-media.block.js";
import { StandaloneRichTextBlock } from "@src/common/blocks/standalone-rich-text.block.js";
import { TableBlock } from "@src/common/blocks/table.block.js";
import { TextImageBlock } from "@src/common/blocks/text-image.block.js";
import { TipTapRichTextBlock } from "@src/common/blocks/tip-tap-rich-text.block.js";
import { TipTapTableBlock } from "@src/common/blocks/tip-tap-table.block.js";
import { BillboardTeaserBlock } from "@src/documents/pages/blocks/billboard-teaser.block.js";
import { ColumnsBlock } from "@src/documents/pages/blocks/columns.block.js";
import { ContentGroupBlock } from "@src/documents/pages/blocks/content-group.block.js";
import { KeyFactsBlock } from "@src/documents/pages/blocks/key-facts.block.js";
import { TeaserBlock } from "@src/documents/pages/blocks/teaser.block.js";
import { NewsDetailBlock } from "@src/news/blocks/news-detail.block.js";
import { NewsListBlock } from "@src/news/blocks/news-list.block.js";
import { ProductListBlock } from "@src/products/blocks/product-list.block.js";
import { UserGroup } from "@src/user-groups/user-group.js";
import { IsEnum } from "class-validator";

import { FullWidthImageBlock } from "./full-width-image.block.js";
import { LayoutBlock } from "./layout.block.js";
import { SliderBlock } from "./slider.block.js";

const supportedBlocks = {
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
    newsDetail: NewsDetailBlock,
    newsList: NewsListBlock,
    layout: LayoutBlock,
    textImage: TextImageBlock,
    fullWidthImage: FullWidthImageBlock,
    table: TableBlock,
    tipTapTable: TipTapTableBlock,
    tipTapRichText: TipTapRichTextBlock,
    productList: ProductListBlock,
    pageTreeIndex: PageTreeIndexBlock,
    contactForm: ContactFormBlock,
};

class BlocksBlockItemData extends BaseBlocksBlockItemData(supportedBlocks) {
    @BlockField({ type: "enum", enum: UserGroup })
    userGroup: UserGroup;
}

class BlocksBlockItemInput extends BaseBlocksBlockItemInput(supportedBlocks, BlocksBlockItemData) {
    @BlockField({ type: "enum", enum: UserGroup })
    @IsEnum(UserGroup)
    userGroup: UserGroup;
}

export const PageContentBlock = createBlocksBlock(
    {
        supportedBlocks,
        BlocksBlockItemData,
        BlocksBlockItemInput,
    },
    "PageContent",
);
