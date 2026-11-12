import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import type { InlineTipTapRichTextBlock } from "@src/common/blocks/inline-tip-tap-rich-text.block.js";
import { faker } from "@src/db/fixtures/faker.js";

@Injectable()
export class InlineTipTapRichTextBlockFixtureService {
    async generateBlockInput(text = faker.lorem.sentence()): Promise<ExtractBlockInputFactoryProps<typeof InlineTipTapRichTextBlock>> {
        return {
            tipTapContent: {
                type: "doc",
                content: [{ type: "textBlock", attrs: { textBlock: "paragraph" }, content: [{ type: "text", text }] }],
            },
        };
    }
}
