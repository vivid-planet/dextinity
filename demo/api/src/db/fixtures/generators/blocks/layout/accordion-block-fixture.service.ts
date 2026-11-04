import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { AccordionBlock } from "@src/common/blocks/accordion.block";
import { AccordionContentBlock, AccordionItemBlock, AccordionItemTitleHtmlTag } from "@src/common/blocks/accordion-item.block";
import { faker } from "@src/db/fixtures/faker";

import { BlockFixture } from "../block-fixture";
import { StandaloneCallToActionListBlockFixtureService } from "../navigation/standalone-call-to-action-list-block-fixture.service";
import { RichTextBlockFixtureService } from "../text-and-content/rich-text-block-fixture.service";
import { StandaloneHeadingBlockFixtureService } from "../text-and-content/standalone-heading-block-fixture.service";
import { TextImageBlockFixtureService } from "../text-and-content/text-image-block-fixture.service";
import { SpaceBlockFixtureService } from "./space-block-fixture.service";

@Injectable()
export class AccordionBlockFixtureService {
    constructor(
        private readonly richTextBlockFixtureService: RichTextBlockFixtureService,
        private readonly headingBlockFixtureService: StandaloneHeadingBlockFixtureService,
        private readonly spaceBlockFixtureService: SpaceBlockFixtureService,
        private readonly callToActionListBlockFixtureService: StandaloneCallToActionListBlockFixtureService,
        private readonly textImageBlockFixtureService: TextImageBlockFixtureService,
    ) {}

    async generateAccordionContentBlock(): Promise<ExtractBlockInputFactoryProps<typeof AccordionContentBlock>> {
        const blocks: ExtractBlockInputFactoryProps<typeof AccordionContentBlock>["blocks"] = [];
        const blockCfg: Record<(typeof blocks)[number]["type"], BlockFixture> = {
            richtext: this.richTextBlockFixtureService,
            heading: this.headingBlockFixtureService,
            space: this.spaceBlockFixtureService,
            callToActionList: this.callToActionListBlockFixtureService,
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
            blocks,
        };
    }

    async generateAccordionItemBlock(): Promise<ExtractBlockInputFactoryProps<typeof AccordionItemBlock>> {
        return {
            title: faker.lorem.words({ min: 3, max: 9 }),
            content: await this.generateAccordionContentBlock(),
            openByDefault: faker.datatype.boolean(),
            titleHtmlTag: faker.helpers.arrayElement(Object.values(AccordionItemTitleHtmlTag)),
        };
    }

    async generateBlockInput(min = 2, max = 6): Promise<ExtractBlockInputFactoryProps<typeof AccordionBlock>> {
        const blockAmount = faker.number.int({ min, max });
        const blocks = [];

        for (let i = 0; i < blockAmount; i++) {
            blocks.push({
                key: faker.string.uuid(),
                visible: true,
                props: await this.generateAccordionItemBlock(),
            });
        }

        return {
            blocks: blocks,
        };
    }
}
