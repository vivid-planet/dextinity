import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import type { InlineRichTextBlock } from "@src/common/blocks/inline-rich-text.block.js";
import { faker } from "@src/db/fixtures/faker.js";

@Injectable()
export class InlineRichTextBlockFixtureService {
    async generateBlockInput(text = faker.lorem.sentence()): Promise<ExtractBlockInputFactoryProps<typeof InlineRichTextBlock>> {
        return {
            tipTapContent: {
                type: "doc",
                content: [{ type: "textBlock", attrs: { textBlock: "paragraph" }, content: [{ type: "text", text }] }],
            },
        };
    }
}
