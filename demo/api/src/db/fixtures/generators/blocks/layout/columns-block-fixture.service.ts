import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker";
import { StandaloneRichTextBlockFixtureService } from "@src/db/fixtures/generators/blocks/text-and-content/standalone-rich-text-block-fixture.service";
import { ColumnsBlock, ColumnsContentBlock } from "@src/documents/pages/blocks/columns.block";

import { BlockFixture } from "../block-fixture";
import { MediaGalleryBlockFixtureService } from "../media/media-gallery-block-fixture.service";
import { StandaloneMediaBlockFixtureService } from "../media/standalone-media-block-fixture.service";
import { AnchorBlockFixtureService } from "../navigation/anchor-block-fixture.service";
import { StandaloneCallToActionListBlockFixtureService } from "../navigation/standalone-call-to-action-list-block-fixture.service";
import { StandaloneHeadingBlockFixtureService } from "../text-and-content/standalone-heading-block-fixture.service";
import { TextImageBlockFixtureService } from "../text-and-content/text-image-block-fixture.service";
import { AccordionBlockFixtureService } from "./accordion-block-fixture.service";
import { SpaceBlockFixtureService } from "./space-block-fixture.service";

const oneColumnLayouts = [{ name: "2-20-2" }];

@Injectable()
export class ColumnsBlockFixtureService {
    constructor(
        private readonly accordionBlockFixtureService: AccordionBlockFixtureService,
        private readonly anchorBlockFixtureService: AnchorBlockFixtureService,
        private readonly callToActionListBlockFixtureService: StandaloneCallToActionListBlockFixtureService,
        private readonly headingBlockFixtureService: StandaloneHeadingBlockFixtureService,
        private readonly standaloneRichTextBlockFixtureService: StandaloneRichTextBlockFixtureService,
        private readonly mediaGalleryBlockFixtureService: MediaGalleryBlockFixtureService,
        private readonly spaceBlockFixtureService: SpaceBlockFixtureService,
        private readonly standaloneMediaBlockFixtureService: StandaloneMediaBlockFixtureService,
        private readonly textImageBlockFixtureService: TextImageBlockFixtureService,
    ) {}

    async generateColumnsContentBlock(): Promise<ExtractBlockInputFactoryProps<typeof ColumnsContentBlock>> {
        const blocks: ExtractBlockInputFactoryProps<typeof ColumnsContentBlock>["blocks"] = [];

        const blockCfg: Record<(typeof blocks)[number]["type"], BlockFixture> = {
            accordion: this.accordionBlockFixtureService,
            anchor: this.anchorBlockFixtureService,
            callToActionList: this.callToActionListBlockFixtureService,
            heading: this.headingBlockFixtureService,
            media: this.standaloneMediaBlockFixtureService,
            mediaGallery: this.mediaGalleryBlockFixtureService,
            richtext: this.standaloneRichTextBlockFixtureService,
            space: this.spaceBlockFixtureService,
            textImage: this.textImageBlockFixtureService,
        };

        for (const block of Object.entries(blockCfg)) {
            const [type, generator] = block;
            const props = await generator.generateBlockInput();

            blocks.push({
                key: faker.string.uuid(),
                visible: true,
                type: type as keyof typeof blockCfg,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                props: props as any,
            });
        }

        return {
            blocks: blocks,
        };
    }

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof ColumnsBlock>> {
        const content = await this.generateColumnsContentBlock();

        return {
            layout: faker.helpers.arrayElement(oneColumnLayouts).name,
            columns: [
                {
                    key: faker.string.uuid(),
                    visible: true,
                    props: content,
                },
            ],
        };
    }
}
