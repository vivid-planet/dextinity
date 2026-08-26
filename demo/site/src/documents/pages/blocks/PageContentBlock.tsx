"use client";
import { BlocksBlock, type PropsWithData, type SupportedBlocks } from "@dextinity/site-nextjs";
import type { PageContentBlockData } from "@src/blocks.generated";
import { PageContentAccordionBlock } from "@src/common/blocks/AccordionBlock";
import { AnchorBlock } from "@src/common/blocks/AnchorBlock";
import { ContactFormBlock } from "@src/common/blocks/ContactFormBlock";
import { DamImageBlock } from "@src/common/blocks/DamImageBlock";
import { LayoutBlock } from "@src/common/blocks/LayoutBlock";
import { PageContentMediaGalleryBlock } from "@src/common/blocks/MediaGalleryBlock";
import { PageTreeIndexBlock } from "@src/common/blocks/PageTreeIndexBlock";
import { SpaceBlock } from "@src/common/blocks/SpaceBlock";
import { PageContentStandaloneCallToActionListBlock } from "@src/common/blocks/StandaloneCallToActionListBlock";
import { PageContentStandaloneHeadingBlock } from "@src/common/blocks/StandaloneHeadingBlock";
import { StandaloneMediaBlock } from "@src/common/blocks/StandaloneMediaBlock";
import { PageContentStandaloneRichTextBlock } from "@src/common/blocks/StandaloneRichTextBlock";
import { TableBlock } from "@src/common/blocks/TableBlock";
import { PageContentTextImageBlock } from "@src/common/blocks/TextImageBlock";
import { PageContentTipTapRichTextBlock } from "@src/common/blocks/TipTapRichTextBlock";
import { TipTapTableBlock } from "@src/common/blocks/TipTapTableBlock";
import { BillboardTeaserBlock } from "@src/documents/pages/blocks/BillboardTeaserBlock";
import { ColumnsBlock } from "@src/documents/pages/blocks/ColumnsBlock";
import { ContentGroupBlock } from "@src/documents/pages/blocks/ContentGroupBlock";
import { FullWidthImageBlock } from "@src/documents/pages/blocks/FullWidthImageBlock";
import { KeyFactsBlock } from "@src/documents/pages/blocks/KeyFactsBlock";
import { ProductListBlock } from "@src/documents/pages/blocks/ProductListBlock";
import { SliderBlock } from "@src/documents/pages/blocks/SliderBlock";
import { TeaserBlock } from "@src/documents/pages/blocks/TeaserBlock";
import { NewsDetailBlock } from "@src/news/blocks/NewsDetailBlock";
import { NewsListBlock } from "@src/news/blocks/NewsListBlock";

const supportedBlocks: SupportedBlocks = {
    accordion: (props) => <PageContentAccordionBlock data={props} />,
    anchor: (props) => <AnchorBlock data={props} />,
    billboardTeaser: (props) => <BillboardTeaserBlock data={props} />,
    space: (props) => <SpaceBlock data={props} />,
    teaser: (props) => <TeaserBlock data={props} />,
    richtext: (props) => <PageContentStandaloneRichTextBlock data={props} />,
    heading: (props) => <PageContentStandaloneHeadingBlock data={props} />,
    columns: (props) => <ColumnsBlock data={props} />,
    callToActionList: (props) => <PageContentStandaloneCallToActionListBlock data={props} />,
    keyFacts: (props) => <KeyFactsBlock data={props} />,
    media: (props) => <StandaloneMediaBlock data={props} />,
    contentGroup: (props) => <ContentGroupBlock data={props} />,
    mediaGallery: (props) => <PageContentMediaGalleryBlock data={props} />,
    slider: (props) => <SliderBlock data={props} />,

    newsList: (props) => <NewsListBlock data={props} />,
    newsDetail: (props) => <NewsDetailBlock data={props} />,
    image: (props) => <DamImageBlock data={props} aspectRatio="inherit" />,
    layout: (props) => <LayoutBlock data={props} />,
    textImage: (props) => <PageContentTextImageBlock data={props} />,
    fullWidthImage: (props) => <FullWidthImageBlock data={props} />,
    table: (props) => <TableBlock data={props} />,
    tipTapTable: (props) => <TipTapTableBlock data={props} />,
    tipTapRichText: (props) => <PageContentTipTapRichTextBlock data={props} />,
    productList: (props) => <ProductListBlock data={props} />,
    pageTreeIndex: (props) => <PageTreeIndexBlock data={props} />,
    contactForm: (props) => <ContactFormBlock data={props} />,
};

export const PageContentBlock = ({ data }: PropsWithData<PageContentBlockData>) => {
    return <BlocksBlock data={data} supportedBlocks={supportedBlocks} />;
};
