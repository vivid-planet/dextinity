import { AttachedDocument, DependenciesModule } from "@dextinity/cms-api";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@src/config/config.module.js";
import { DamFile } from "@src/dam/entities/dam-file.entity.js";
import { FixturesCommand } from "@src/db/fixtures/fixtures.command.js";
import { StandaloneRichTextBlockFixtureService } from "@src/db/fixtures/generators/blocks/text-and-content/standalone-rich-text-block-fixture.service.js";
import { Link } from "@src/documents/links/entities/link.entity.js";
import { LinksModule } from "@src/documents/links/links.module.js";
import { Page } from "@src/documents/pages/entities/page.entity.js";
import { PagesModule } from "@src/documents/pages/pages.module.js";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity.js";
import { Manufacturer } from "@src/products/entities/manufacturer.entity.js";
import { Product } from "@src/products/entities/product.entity.js";
import { ProductCategory } from "@src/products/entities/product-category.entity.js";
import { ProductCategoryType } from "@src/products/entities/product-category-type.entity.js";

import { AccordionBlockFixtureService } from "./generators/blocks/layout/accordion-block-fixture.service.js";
import { ColumnsBlockFixtureService } from "./generators/blocks/layout/columns-block-fixture.service.js";
import { ContentGroupBlockFixtureService } from "./generators/blocks/layout/content-group-block-fixture.service.js";
import { LayoutBlockFixtureService } from "./generators/blocks/layout/layout-block-fixture.service.js";
import { SpaceBlockFixtureService } from "./generators/blocks/layout/space-block-fixture.service.js";
import { DamImageBlockFixtureService } from "./generators/blocks/media/dam-image-block-fixture.service.js";
import { DamVideoBlockFixtureService } from "./generators/blocks/media/dam-video-block-fixture.service.js";
import { FullWidthImageBlockFixtureService } from "./generators/blocks/media/full-width-image-block-fixture.service.js";
import { MediaBlockFixtureService } from "./generators/blocks/media/media-block.fixture.service.js";
import { MediaGalleryBlockFixtureService } from "./generators/blocks/media/media-gallery-block-fixture.service.js";
import { PixelImageBlockFixtureService } from "./generators/blocks/media/pixel-image-block-fixture.service.js";
import { StandaloneMediaBlockFixtureService } from "./generators/blocks/media/standalone-media-block-fixture.service.js";
import { SvgImageBlockFixtureService } from "./generators/blocks/media/svg-image-block-fixture.service.js";
import { VimeoVideoBlockFixtureService } from "./generators/blocks/media/vimeo-video-block-fixture.service.js";
import { YouTubeVideoBlockFixtureService } from "./generators/blocks/media/youtube-video-block-fixture.service.js";
import { AnchorBlockFixtureService } from "./generators/blocks/navigation/anchor-block-fixture.service.js";
import { CallToActionBlockFixtureService } from "./generators/blocks/navigation/call-to-action-block-fixture.service.js";
import { CallToActionListBlockFixtureService } from "./generators/blocks/navigation/call-to-action-list-block.service.js";
import { ContactFormBlockFixtureService } from "./generators/blocks/navigation/contact-form-block-fixture.service.js";
import { LinkBlockFixtureService } from "./generators/blocks/navigation/link-block-fixture.service.js";
import { LinkListBlockFixtureService } from "./generators/blocks/navigation/link-list-block-fixture.service.js";
import { PageTreeIndexBlockFixtureService } from "./generators/blocks/navigation/page-tree-index-block-fixture.service.js";
import { StandaloneCallToActionListBlockFixtureService } from "./generators/blocks/navigation/standalone-call-to-action-list-block-fixture.service.js";
import { TextLinkBlockFixtureService } from "./generators/blocks/navigation/text-link-block-fixture.service.js";
import { SliderBlockFixtureService } from "./generators/blocks/slider-fixture.service.js";
import { BasicStageBlockFixtureService } from "./generators/blocks/stage/basic-stage-block-fixture.service.js";
import { BillboardTeaserBlockFixtureService } from "./generators/blocks/teaser/billboard-teaser-block-fixture.service.js";
import { TeaserBlockFixtureService } from "./generators/blocks/teaser/teaser-block-fixture.service.js";
import { HeadingBlockFixtureService } from "./generators/blocks/text-and-content/heading-block-fixture.service.js";
import { KeyFactsBlockFixtureService } from "./generators/blocks/text-and-content/key-facts-block-fixture.service.js";
import { ProductListBlockFixtureService } from "./generators/blocks/text-and-content/product-list-block.fixture.js";
import { RichTextBlockFixtureService } from "./generators/blocks/text-and-content/rich-text-block-fixture.service.js";
import { StandaloneHeadingBlockFixtureService } from "./generators/blocks/text-and-content/standalone-heading-block-fixture.service.js";
import { TableBlockFixtureService } from "./generators/blocks/text-and-content/table-block-fixture.service.js";
import { TextImageBlockFixtureService } from "./generators/blocks/text-and-content/text-image-block-fixture.service.js";
import { TipTapRichTextBlockFixtureService } from "./generators/blocks/text-and-content/tip-tap-rich-text-block-fixture.service.js";
import { TipTapTableBlockFixtureService } from "./generators/blocks/text-and-content/tip-tap-table-block-fixture.service.js";
import { DocumentGeneratorService } from "./generators/document-generator.service.js";
import { DraftJsMigrationPageFixtureService } from "./generators/draft-js-migration-page-fixture.service.js";
import { FileUploadsFixtureService } from "./generators/file-uploads-fixture.service.js";
import { ImageFileFixtureService } from "./generators/image-file-fixture.service.js";
import { ImageFixtureService } from "./generators/image-fixture.service.js";
import { ManyImagesTestPageFixtureService } from "./generators/many-images-test-page-fixture.service.js";
import { NewsFixtureService } from "./generators/news-fixture.service.js";
import { PageContentBlockFixtureService } from "./generators/page-content-block-fixture.service.js";
import { ProductsFixtureService } from "./generators/products-fixture.service.js";
import { RedirectsFixtureService } from "./generators/redirects-fixture.service.js";
import { SeoBlockFixtureService } from "./generators/seo-block-fixture.service.js";
import { StageBlockFixtureService } from "./generators/stage-block-fixture.service.js";
import { SvgImageFileFixtureService } from "./generators/svg-image-file-fixture.service.js";
import { VideoFixtureService } from "./generators/video-fixture.service.js";
import { WelcomeEmailFixtureService } from "./generators/welcome-email-fixture.service.js";

@Module({
    imports: [
        ConfigModule,
        PagesModule,
        LinksModule,
        DependenciesModule,
        MikroOrmModule.forFeature([DamFile, Page, Link, Product, ProductCategory, ProductCategoryType, Manufacturer, PageTreeNode, AttachedDocument]),
    ],
    providers: [
        FixturesCommand,
        AccordionBlockFixtureService,
        AnchorBlockFixtureService,
        BasicStageBlockFixtureService,
        BillboardTeaserBlockFixtureService,
        CallToActionBlockFixtureService,
        CallToActionListBlockFixtureService,
        ColumnsBlockFixtureService,
        ContactFormBlockFixtureService,
        ContentGroupBlockFixtureService,
        DamImageBlockFixtureService,
        DamVideoBlockFixtureService,
        DocumentGeneratorService,
        DraftJsMigrationPageFixtureService,
        FileUploadsFixtureService,
        FullWidthImageBlockFixtureService,
        HeadingBlockFixtureService,
        ImageFileFixtureService,
        ImageFixtureService,
        KeyFactsBlockFixtureService,
        LayoutBlockFixtureService,
        LinkBlockFixtureService,
        LinkListBlockFixtureService,
        ManyImagesTestPageFixtureService,
        MediaGalleryBlockFixtureService,
        MediaBlockFixtureService,
        PageContentBlockFixtureService,
        PageTreeIndexBlockFixtureService,
        PixelImageBlockFixtureService,
        RedirectsFixtureService,
        ProductsFixtureService,
        RichTextBlockFixtureService,
        SeoBlockFixtureService,
        SliderBlockFixtureService,
        SpaceBlockFixtureService,
        StageBlockFixtureService,
        SvgImageBlockFixtureService,
        SvgImageFileFixtureService,
        StageBlockFixtureService,
        StandaloneCallToActionListBlockFixtureService,
        StandaloneHeadingBlockFixtureService,
        StandaloneMediaBlockFixtureService,
        StandaloneRichTextBlockFixtureService,
        TeaserBlockFixtureService,
        TextImageBlockFixtureService,
        TextLinkBlockFixtureService,
        VideoFixtureService,
        VimeoVideoBlockFixtureService,
        YouTubeVideoBlockFixtureService,
        NewsFixtureService,
        ProductListBlockFixtureService,
        TableBlockFixtureService,
        TipTapRichTextBlockFixtureService,
        TipTapTableBlockFixtureService,
        WelcomeEmailFixtureService,
    ],
})
export class FixturesModule {}
