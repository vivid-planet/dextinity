import { AnchorBlock, BaseBlocksBlockItemData, BaseBlocksBlockItemInput, BlockField, createBlocksBlock, DamImageBlock } from "@dextinity/cms-api";
import { AccordionBlock } from "@src/common/blocks/accordion.block";
import { ContactFormBlock } from "@src/common/blocks/contact-form.block";
import { MediaGalleryBlock } from "@src/common/blocks/media-gallery.block";
import { PageTreeIndexBlock } from "@src/common/blocks/page-tree-index.block";
import { SpaceBlock } from "@src/common/blocks/space.block";
import { StandaloneCallToActionListBlock } from "@src/common/blocks/standalone-call-to-action-list.block";
import { StandaloneHeadingBlock } from "@src/common/blocks/standalone-heading.block";
import { StandaloneMediaBlock } from "@src/common/blocks/standalone-media.block";
import { StandaloneRichTextBlock } from "@src/common/blocks/standalone-rich-text.block";
import { TableBlock } from "@src/common/blocks/table.block";
import { TextImageBlock } from "@src/common/blocks/text-image.block";
import { TipTapRichTextBlock } from "@src/common/blocks/tip-tap-rich-text.block";
import { TipTapTableBlock } from "@src/common/blocks/tip-tap-table.block";
import { BillboardTeaserBlock } from "@src/documents/pages/blocks/billboard-teaser.block";
import { ColumnsBlock } from "@src/documents/pages/blocks/columns.block";
import { ContentGroupBlock } from "@src/documents/pages/blocks/content-group.block";
import { KeyFactsBlock } from "@src/documents/pages/blocks/key-facts.block";
import { TeaserBlock } from "@src/documents/pages/blocks/teaser.block";
import { NewsDetailBlock } from "@src/news/blocks/news-detail.block";
import { NewsListBlock } from "@src/news/blocks/news-list.block";
import { ProductListBlock } from "@src/products/blocks/product-list.block";
import { UserGroup } from "@src/user-groups/user-group";
import { IsEnum } from "class-validator";

import { FullWidthImageBlock } from "./full-width-image.block";
import { LayoutBlock } from "./layout.block";
import { SliderBlock } from "./slider.block";

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
