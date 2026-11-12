import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import type { TipTapRichTextBlock } from "@src/common/blocks/tip-tap-rich-text.block.js";
import { faker } from "@src/db/fixtures/faker.js";

@Injectable()
export class TipTapRichTextBlockFixtureService {
    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof TipTapRichTextBlock>> {
        const paragraphCount = faker.number.int({ min: 1, max: 3 });

        return {
            tipTapContent: {
                type: "doc",
                content: Array.from({ length: paragraphCount }, () => ({
                    type: "textBlock",
                    attrs: { textBlock: "paragraph", textBlockStyle: faker.helpers.arrayElement(["paragraph300", "paragraph200"]) },
                    content: [{ type: "text", text: faker.lorem.paragraph() }],
                })),
            },
        };
    }
}
