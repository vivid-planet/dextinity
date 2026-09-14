import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker";
import { KeyFactsBlock } from "@src/documents/pages/blocks/key-facts.block";
import { KeyFactsItemBlock } from "@src/documents/pages/blocks/key-facts-item.block";

import { SvgImageBlockFixtureService } from "../media/svg-image-block-fixture.service";
import { RichTextBlockFixtureService } from "./rich-text-block-fixture.service";

@Injectable()
export class KeyFactsBlockFixtureService {
    constructor(
        private readonly svgImageBlockFixtureService: SvgImageBlockFixtureService,
        private readonly richTextBlockFixtureService: RichTextBlockFixtureService,
    ) {}

    async generateKeyFactsItemBlock(): Promise<ExtractBlockInputFactoryProps<typeof KeyFactsItemBlock>> {
        return {
            icon: await this.svgImageBlockFixtureService.generateBlockInput(),
            fact: faker.lorem.sentence(),
            label: faker.lorem.sentence(),
            description: await this.richTextBlockFixtureService.generateBlockInput(),
        };
    }

    async generateBlockInput(min = 2, max = 6): Promise<ExtractBlockInputFactoryProps<typeof KeyFactsBlock>> {
        const blockAmount = faker.number.int({ min, max });
        const blocks = [];

        for (let i = 0; i < blockAmount; i++) {
            blocks.push({
                key: faker.string.uuid(),
                visible: true,
                props: await this.generateKeyFactsItemBlock(),
            });
        }

        return {
            blocks: blocks,
        };
    }
}
