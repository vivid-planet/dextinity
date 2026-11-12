import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { type HeadingBlock, HeadlineTag } from "@src/common/blocks/heading.block.js";
import { faker } from "@src/db/fixtures/faker.js";

import { InlineRichTextBlockFixtureService } from "./inline-rich-text-block-fixture.service.js";

@Injectable()
export class HeadingBlockFixtureService {
    constructor(private readonly inlineRichTextBlockFixtureService: InlineRichTextBlockFixtureService) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof HeadingBlock>> {
        const headlineTextBlocks = ["headline600", "headline550", "headline500", "headline450", "headline400", "headline350"];

        return {
            eyebrow: await this.inlineRichTextBlockFixtureService.generateBlockInput(faker.lorem.words({ min: 3, max: 9 })),
            headline: {
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "textBlock",
                            attrs: { textBlock: faker.helpers.arrayElement(headlineTextBlocks) },
                            content: [{ type: "text", text: faker.lorem.words({ min: 3, max: 9 }) }],
                        },
                    ],
                },
            },
            htmlTag: faker.helpers.arrayElement(Object.values(HeadlineTag)),
        };
    }
}
