import { AttachedDocument, DependenciesModule } from "@dextinity/cms-api";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@src/config/config.module";
import { DamFile } from "@src/dam/entities/dam-file.entity";
import { FixturesCommand } from "@src/db/fixtures/fixtures.command";
import { StandaloneRichTextBlockFixtureService } from "@src/db/fixtures/generators/blocks/text-and-content/standalone-rich-text-block-fixture.service";
import { Link } from "@src/documents/links/entities/link.entity";
import { LinksModule } from "@src/documents/links/links.module";
import { Page } from "@src/documents/pages/entities/page.entity";
import { PagesModule } from "@src/documents/pages/pages.module";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity";
import { Manufacturer } from "@src/products/entities/manufacturer.entity";
import { Product } from "@src/products/entities/product.entity";
import { ProductCategory } from "@src/products/entities/product-category.entity";
import { ProductCategoryType } from "@src/products/entities/product-category-type.entity";

import { AccordionBlockFixtureService } from "./generators/blocks/layout/accordion-block-fixture.service";
import { ColumnsBlockFixtureService } from "./generators/blocks/layout/columns-block-fixture.service";
import { ContentGroupBlockFixtureService } from "./generators/blocks/layout/content-group-block-fixture.service";
import { LayoutBlockFixtureService } from "./generators/blocks/layout/layout-block-fixture.service";
import { SpaceBlockFixtureService } from "./generators/blocks/layout/space-block-fixture.service";
import { DamImageBlockFixtureService } from "./generators/blocks/media/dam-image-block-fixture.service";
import { DamVideoBlockFixtureService } from "./generators/blocks/media/dam-video-block-fixture.service";
import { FullWidthImageBlockFixtureService } from "./generators/blocks/media/full-width-image-block-fixture.service";
import { MediaBlockFixtureService } from "./generators/blocks/media/media-block.fixture.service";
import { MediaGalleryBlockFixtureService } from "./generators/blocks/media/media-gallery-block-fixture.service";
import { PixelImageBlockFixtureService } from "./generators/blocks/media/pixel-image-block-fixture.service";
import { StandaloneMediaBlockFixtureService } from "./generators/blocks/media/standalone-media-block-fixture.service";
import { SvgImageBlockFixtureService } from "./generators/blocks/media/svg-image-block-fixture.service";
import { VimeoVideoBlockFixtureService } from "./generators/blocks/media/vimeo-video-block-fixture.service";
import { YouTubeVideoBlockFixtureService } from "./generators/blocks/media/youtube-video-block-fixture.service";
import { AnchorBlockFixtureService } from "./generators/blocks/navigation/anchor-block-fixture.service";
import { CallToActionBlockFixtureService } from "./generators/blocks/navigation/call-to-action-block-fixture.service";
import { CallToActionListBlockFixtureService } from "./generators/blocks/navigation/call-to-action-list-block.service";
import { ContactFormBlockFixtureService } from "./generators/blocks/navigation/contact-form-block-fixture.service";
import { LinkBlockFixtureService } from "./generators/blocks/navigation/link-block-fixture.service";
import { LinkListBlockFixtureService } from "./generators/blocks/navigation/link-list-block-fixture.service";
import { PageTreeIndexBlockFixtureService } from "./generators/blocks/navigation/page-tree-index-block-fixture.service";
import { StandaloneCallToActionListBlockFixtureService } from "./generators/blocks/navigation/standalone-call-to-action-list-block-fixture.service";
import { TextLinkBlockFixtureService } from "./generators/blocks/navigation/text-link-block-fixture.service";
import { SliderBlockFixtureService } from "./generators/blocks/slider-fixture.service";
import { BasicStageBlockFixtureService } from "./generators/blocks/stage/basic-stage-block-fixture.service";
import { BillboardTeaserBlockFixtureService } from "./generators/blocks/teaser/billboard-teaser-block-fixture.service";
import { TeaserBlockFixtureService } from "./generators/blocks/teaser/teaser-block-fixture.service";
import { HeadingBlockFixtureService } from "./generators/blocks/text-and-content/heading-block-fixture.service";
import { KeyFactsBlockFixtureService } from "./generators/blocks/text-and-content/key-facts-block-fixture.service";
import { ProductListBlockFixtureService } from "./generators/blocks/text-and-content/product-list-block.fixture";
import { RichTextBlockFixtureService } from "./generators/blocks/text-and-content/rich-text-block-fixture.service";
import { StandaloneHeadingBlockFixtureService } from "./generators/blocks/text-and-content/standalone-heading-block-fixture.service";
import { TableBlockFixtureService } from "./generators/blocks/text-and-content/table-block-fixture.service";
import { TextImageBlockFixtureService } from "./generators/blocks/text-and-content/text-image-block-fixture.service";
import { TipTapRichTextBlockFixtureService } from "./generators/blocks/text-and-content/tip-tap-rich-text-block-fixture.service";
import { TipTapTableBlockFixtureService } from "./generators/blocks/text-and-content/tip-tap-table-block-fixture.service";
import { DocumentGeneratorService } from "./generators/document-generator.service";
import { DraftJsMigrationPageFixtureService } from "./generators/draft-js-migration-page-fixture.service";
import { FileUploadsFixtureService } from "./generators/file-uploads-fixture.service";
import { ImageFileFixtureService } from "./generators/image-file-fixture.service";
import { ImageFixtureService } from "./generators/image-fixture.service";
import { ManyImagesTestPageFixtureService } from "./generators/many-images-test-page-fixture.service";
import { NewsFixtureService } from "./generators/news-fixture.service";
import { PageContentBlockFixtureService } from "./generators/page-content-block-fixture.service";
import { ProductsFixtureService } from "./generators/products-fixture.service";
import { RedirectsFixtureService } from "./generators/redirects-fixture.service";
import { SeoBlockFixtureService } from "./generators/seo-block-fixture.service";
import { StageBlockFixtureService } from "./generators/stage-block-fixture.service";
import { SvgImageFileFixtureService } from "./generators/svg-image-file-fixture.service";
import { VideoFixtureService } from "./generators/video-fixture.service";
import { WelcomeEmailFixtureService } from "./generators/welcome-email-fixture.service";

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
