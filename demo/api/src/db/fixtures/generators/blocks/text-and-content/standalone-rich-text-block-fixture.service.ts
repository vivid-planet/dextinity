import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { type StandaloneRichTextBlock, TextAlignment } from "@src/common/blocks/standalone-rich-text.block.js";
import { RichTextBlockFixtureService } from "@src/db/fixtures/generators/blocks/text-and-content/rich-text-block-fixture.service.js";

@Injectable()
export class StandaloneRichTextBlockFixtureService {
    constructor(private readonly richTextBlockFixtureService: RichTextBlockFixtureService) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof StandaloneRichTextBlock>> {
        return {
            richText: await this.richTextBlockFixtureService.generateBlockInput(),
            textAlignment: TextAlignment.left,
        };
    }
}
