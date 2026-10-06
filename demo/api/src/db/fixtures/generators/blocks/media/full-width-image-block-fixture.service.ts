import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker.js";
import type { FullWidthImageBlock } from "@src/documents/pages/blocks/full-width-image.block.js";

import { RichTextBlockFixtureService } from "../text-and-content/rich-text-block-fixture.service.js";
import { DamImageBlockFixtureService } from "./dam-image-block-fixture.service.js";

@Injectable()
export class FullWidthImageBlockFixtureService {
    constructor(
        private readonly damImageBlockFixtureService: DamImageBlockFixtureService,
        private readonly richTextBlockFixtureService: RichTextBlockFixtureService,
    ) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof FullWidthImageBlock>> {
        return {
            content: {
                ...(await this.richTextBlockFixtureService.generateBlockInput()),
                visible: faker.datatype.boolean({ probability: 1.0 }),
            },
            image: await this.damImageBlockFixtureService.generateBlockInput(),
        };
    }
}
