import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import type { DescriptionRichTextBlock } from "@src/common/blocks/description-rich-text.block.js";
import { faker } from "@src/db/fixtures/faker.js";

@Injectable()
export class DescriptionRichTextBlockFixtureService {
    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof DescriptionRichTextBlock>> {
        return {
            tipTapContent: {
                type: "doc",
                content: [{ type: "textBlock", attrs: { textBlock: "paragraph" }, content: [{ type: "text", text: faker.lorem.sentence() }] }],
            },
        };
    }
}
