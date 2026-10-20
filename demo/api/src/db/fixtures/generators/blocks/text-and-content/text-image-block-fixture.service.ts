import { type ExtractBlockInputFactoryProps, ImagePosition } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import type { TextImageBlock } from "@src/common/blocks/text-image.block.js";
import { faker } from "@src/db/fixtures/faker.js";

import { DamImageBlockFixtureService } from "../media/dam-image-block-fixture.service.js";
import { RichTextBlockFixtureService } from "./rich-text-block-fixture.service.js";

@Injectable()
export class TextImageBlockFixtureService {
    constructor(
        private readonly damImageBlockFixtureService: DamImageBlockFixtureService,
        private readonly richTextBlockFixtureService: RichTextBlockFixtureService,
    ) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof TextImageBlock>> {
        return {
            image: await this.damImageBlockFixtureService.generateBlockInput(),
            text: await this.richTextBlockFixtureService.generateBlockInput(),
            imagePosition: faker.helpers.arrayElement(Object.values(ImagePosition)),
            imageAspectRatio: "16x9",
        };
    }
}
