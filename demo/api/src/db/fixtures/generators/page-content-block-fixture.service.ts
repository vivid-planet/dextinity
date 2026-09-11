import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker";
import { StandaloneRichTextBlockFixtureService } from "@src/db/fixtures/generators/blocks/text-and-content/standalone-rich-text-block-fixture.service";
import { PageContentBlock } from "@src/documents/pages/blocks/page-content.block";
import { UserGroup } from "@src/user-groups/user-group";

import { BlockFixture } from "./blocks/block-fixture";
import { AccordionBlockFixtureService } from "./blocks/layout/accordion-block-fixture.service";
import { ColumnsBlockFixtureService } from "./blocks/layout/columns-block-fixture.service";
import { ContentGroupBlockFixtureService } from "./blocks/layout/content-group-block-fixture.service";
import { LayoutBlockFixtureService } from "./blocks/layout/layout-block-fixture.service";
import { SpaceBlockFixtureService } from "./blocks/layout/space-block-fixture.service";
import { DamImageBlockFixtureService } from "./blocks/media/dam-image-block-fixture.service";
import { FullWidthImageBlockFixtureService } from "./blocks/media/full-width-image-block-fixture.service";
import { MediaGalleryBlockFixtureService } from "./blocks/media/media-gallery-block-fixture.service";
import { StandaloneMediaBlockFixtureService } from "./blocks/media/standalone-media-block-fixture.service";
import { AnchorBlockFixtureService } from "./blocks/navigation/anchor-block-fixture.service";
import { ContactFormBlockFixtureService } from "./blocks/navigation/contact-form-block-fixture.service";
import { LinkListBlockFixtureService } from "./blocks/navigation/link-list-block-fixture.service";
import { PageTreeIndexBlockFixtureService } from "./blocks/navigation/page-tree-index-block-fixture.service";
import { StandaloneCallToActionListBlockFixtureService } from "./blocks/navigation/standalone-call-to-action-list-block-fixture.service";
import { SliderBlockFixtureService } from "./blocks/slider-fixture.service";
import { BillboardTeaserBlockFixtureService } from "./blocks/teaser/billboard-teaser-block-fixture.service";
import { TeaserBlockFixtureService } from "./blocks/teaser/teaser-block-fixture.service";
import { KeyFactsBlockFixtureService } from "./blocks/text-and-content/key-facts-block-fixture.service";
import { ProductListBlockFixtureService } from "./blocks/text-and-content/product-list-block.fixture";
import { StandaloneHeadingBlockFixtureService } from "./blocks/text-and-content/standalone-heading-block-fixture.service";
import { TableBlockFixtureService } from "./blocks/text-and-content/table-block-fixture.service";
import { TextImageBlockFixtureService } from "./blocks/text-and-content/text-image-block-fixture.service";
import { TipTapRichTextBlockFixtureService } from "./blocks/text-and-content/tip-tap-rich-text-block-fixture.service";
import { TipTapTableBlockFixtureService } from "./blocks/text-and-content/tip-tap-table-block-fixture.service";

export type BlockCategory = "layout" | "media" | "navigation" | "teaser" | "textAndContent" | "form";

@Injectable()
export class PageContentBlockFixtureService {
    constructor(
        private readonly accordionBlockFixtureService: AccordionBlockFixtureService,
        private readonly anchorBlockFixtureService: AnchorBlockFixtureService,
        private readonly billboardTeaserBlockFixtureService: BillboardTeaserBlockFixtureService,
        private readonly callToActionListBlockFixtureService: StandaloneCallToActionListBlockFixtureService,
        private readonly columnsBlockFixtureService: ColumnsBlockFixtureService,
        private readonly contentGroupBlockFixtureService: ContentGroupBlockFixtureService,
        private readonly fullWidthImageBlockFixtureService: FullWidthImageBlockFixtureService,
        private readonly headingBlockFixtureService: StandaloneHeadingBlockFixtureService,
        private readonly imageBlockFixtureService: DamImageBlockFixtureService,
        private readonly keyFactsBlockFixtureService: KeyFactsBlockFixtureService,
        private readonly layoutBlockFixtureService: LayoutBlockFixtureService,
        private readonly linkListBlockFixtureService: LinkListBlockFixtureService,
        private readonly mediaGalleryBlockFixtureService: MediaGalleryBlockFixtureService,
        private readonly spaceBlockFixtureService: SpaceBlockFixtureService,
        private readonly mediaBlockFixtureService: StandaloneMediaBlockFixtureService,
        private readonly teaserBlockFixtureService: TeaserBlockFixtureService,
        private readonly textImageBlockFixtureService: TextImageBlockFixtureService,
        private readonly sliderBlockFixtureService: SliderBlockFixtureService,
        private readonly standaloneRichTextBlockFixtureService: StandaloneRichTextBlockFixtureService,
        private readonly productListBlockFixtureService: ProductListBlockFixtureService,
        private readonly pageTreeIndexBlockFixtureService: PageTreeIndexBlockFixtureService,
        private readonly contactFormBlockFixtureService: ContactFormBlockFixtureService,
        private readonly tableBlockFixtureService: TableBlockFixtureService,
        private readonly tipTapRichTextBlockFixtureService: TipTapRichTextBlockFixtureService,
        private readonly tipTapTableBlockFixtureService: TipTapTableBlockFixtureService,
    ) {}

    async generateBlockInput(blockCategory?: BlockCategory): Promise<ExtractBlockInputFactoryProps<typeof PageContentBlock>> {
        const blocks: ExtractBlockInputFactoryProps<typeof PageContentBlock>["blocks"] = [];

        type SupportedBlocks = (typeof blocks)[number]["type"];

        // TODO add fixtures for newsDetail and newsList
        const fixtures: Record<Exclude<SupportedBlocks, "newsDetail" | "newsList">, [BlockCategory, BlockFixture]> = {
            accordion: ["layout", this.accordionBlockFixtureService],
            columns: ["layout", this.columnsBlockFixtureService],
            contentGroup: ["layout", this.contentGroupBlockFixtureService],
            layout: ["layout", this.layoutBlockFixtureService],
            space: ["layout", this.spaceBlockFixtureService],
            slider: ["layout", this.sliderBlockFixtureService],
            fullWidthImage: ["media", this.fullWidthImageBlockFixtureService],
            image: ["media", this.imageBlockFixtureService],
            media: ["media", this.mediaBlockFixtureService],
            mediaGallery: ["media", this.mediaGalleryBlockFixtureService],
            anchor: ["navigation", this.anchorBlockFixtureService],
            callToActionList: ["navigation", this.callToActionListBlockFixtureService],
            pageTreeIndex: ["navigation", this.pageTreeIndexBlockFixtureService],
            billboardTeaser: ["teaser", this.billboardTeaserBlockFixtureService],
            teaser: ["teaser", this.teaserBlockFixtureService],
            heading: ["textAndContent", this.headingBlockFixtureService],
            keyFacts: ["textAndContent", this.keyFactsBlockFixtureService],
            richtext: ["textAndContent", this.standaloneRichTextBlockFixtureService],
            textImage: ["textAndContent", this.textImageBlockFixtureService],
            productList: ["textAndContent", this.productListBlockFixtureService],
            contactForm: ["form", this.contactFormBlockFixtureService],
            table: ["textAndContent", this.tableBlockFixtureService],
            tipTapRichText: ["textAndContent", this.tipTapRichTextBlockFixtureService],
            tipTapTable: ["textAndContent", this.tipTapTableBlockFixtureService],
        };

        const supportedBlocksFixtureGenerators = Object.entries(fixtures)
            .filter(([, [category]]) => (blockCategory ? category === blockCategory : true))
            .map<[string, BlockFixture]>(([type, [, generator]]) => [type, generator]);

        for (const [type, generator] of supportedBlocksFixtureGenerators) {
            const props = await generator.generateBlockInput();

            blocks.push({
                key: faker.string.uuid(),
                visible: true,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                type: type as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                props: props as any,
                // TODO add custom block attributes to BlocksBlock types
                // @ts-expect-error custom block attributes aren't reflected in types
                userGroup: UserGroup.all,
            });
        }

        return { blocks };
    }
}
