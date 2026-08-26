import { AnchorBlock, createBlocksBlock, DamImageBlock } from "@dextinity/cms-admin";
import { AccordionBlock } from "@src/common/blocks/AccordionBlock";
import { ContactFormBlock } from "@src/common/blocks/ContactFormBlock";
import { LayoutBlock } from "@src/common/blocks/LayoutBlock";
import { MediaGalleryBlock } from "@src/common/blocks/MediaGalleryBlock";
import { PageTreeIndexBlock } from "@src/common/blocks/PageTreeIndexBlock";
import { SpaceBlock } from "@src/common/blocks/SpaceBlock";
import { StandaloneCallToActionListBlock } from "@src/common/blocks/StandaloneCallToActionListBlock";
import { StandaloneHeadingBlock } from "@src/common/blocks/StandaloneHeadingBlock";
import { StandaloneMediaBlock } from "@src/common/blocks/StandaloneMediaBlock";
import { StandaloneRichTextBlock } from "@src/common/blocks/StandaloneRichTextBlock";
import { TableBlock } from "@src/common/blocks/TableBlock";
import { TextImageBlock } from "@src/common/blocks/TextImageBlock";
import { TipTapRichTextBlock } from "@src/common/blocks/TipTapRichTextBlock";
import { TipTapTableBlock } from "@src/common/blocks/TipTapTableBlock";
import { NewsDetailBlock } from "@src/news/blocks/NewsDetailBlock";
import { NewsListBlock } from "@src/news/blocks/NewsListBlock";
import { ProductListBlock } from "@src/products/blocks/ProductListBlock";
import { userGroupAdditionalItemFields } from "@src/userGroups/userGroupAdditionalItemFields";
import { UserGroupChip } from "@src/userGroups/UserGroupChip";
import { UserGroupContextMenuItem } from "@src/userGroups/UserGroupContextMenuItem";

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
    },
    additionalItemFields: {
        ...userGroupAdditionalItemFields,
    },
    AdditionalItemContextMenuItems: ({ item, onChange, onMenuClose }) => {
        return <UserGroupContextMenuItem item={item} onChange={onChange} onMenuClose={onMenuClose} />;
    },
    AdditionalItemContent: ({ item }) => {
        return <UserGroupChip item={item} />;
    },
});
