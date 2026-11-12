import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { type StandaloneRichTextBlock, TextAlignment } from "@src/common/blocks/standalone-rich-text.block.js";
import { TipTapRichTextBlockFixtureService } from "@src/db/fixtures/generators/blocks/text-and-content/tip-tap-rich-text-block-fixture.service.js";

@Injectable()
export class StandaloneRichTextBlockFixtureService {
    constructor(private readonly tipTapRichTextBlockFixtureService: TipTapRichTextBlockFixtureService) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof StandaloneRichTextBlock>> {
        return {
            richText: await this.tipTapRichTextBlockFixtureService.generateBlockInput(),
            textAlignment: TextAlignment.left,
        };
    }
}
