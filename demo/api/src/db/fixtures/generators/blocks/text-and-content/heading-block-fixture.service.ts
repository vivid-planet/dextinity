import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { HeadingBlock, HeadlineTag } from "@src/common/blocks/heading.block";
import { faker } from "@src/db/fixtures/faker";

import { RichTextBlockFixtureService } from "./rich-text-block-fixture.service";

@Injectable()
export class HeadingBlockFixtureService {
    constructor(private readonly richTextBlockFixtureService: RichTextBlockFixtureService) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof HeadingBlock>> {
        const possibleTypes = ["h1", "h2", "h3", "h4", "subHeadlineMedium", "subHeadlineSmall"];

        const eyebrowBlock = {
            key: faker.string.uuid(),
            text: faker.lorem.words({ min: 3, max: 9 }),
            type: faker.helpers.arrayElement(possibleTypes),
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        };

        const headingBlock = {
            key: faker.string.uuid(),
            text: faker.lorem.words({ min: 3, max: 9 }),
            type: faker.helpers.arrayElement(possibleTypes),
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        };

        return {
            eyebrow: await this.richTextBlockFixtureService.generateBlockInput(1, [eyebrowBlock]),
            headline: await this.richTextBlockFixtureService.generateBlockInput(1, [headingBlock]),
            htmlTag: faker.helpers.arrayElement(Object.values(HeadlineTag)),
        };
    }
}
