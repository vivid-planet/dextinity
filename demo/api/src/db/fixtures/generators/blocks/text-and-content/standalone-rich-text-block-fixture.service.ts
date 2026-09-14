import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { StandaloneRichTextBlock, TextAlignment } from "@src/common/blocks/standalone-rich-text.block";
import { RichTextBlockFixtureService } from "@src/db/fixtures/generators/blocks/text-and-content/rich-text-block-fixture.service";

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
