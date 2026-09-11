import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker";
import { LayoutBlock, LayoutBlockLayout } from "@src/documents/pages/blocks/layout.block";

import { MediaBlockFixtureService } from "../media/media-block.fixture.service";
import { RichTextBlockFixtureService } from "../text-and-content/rich-text-block-fixture.service";

@Injectable()
export class LayoutBlockFixtureService {
    constructor(
        private readonly mediaBlockFixtureService: MediaBlockFixtureService,
        private readonly richTextFixtureService: RichTextBlockFixtureService,
    ) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof LayoutBlock>> {
        return {
            layout: faker.helpers.arrayElement(Object.values(LayoutBlockLayout)),
            media1: await this.mediaBlockFixtureService.generateBlockInput(),
            text1: await this.richTextFixtureService.generateBlockInput(),
            media2: await this.mediaBlockFixtureService.generateBlockInput(),
            text2: await this.richTextFixtureService.generateBlockInput(),
        };
    }
}
