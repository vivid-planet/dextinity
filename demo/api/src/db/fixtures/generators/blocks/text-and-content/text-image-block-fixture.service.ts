import { ExtractBlockInputFactoryProps, ImagePosition } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { TextImageBlock } from "@src/common/blocks/text-image.block";
import { faker } from "@src/db/fixtures/faker";

import { DamImageBlockFixtureService } from "../media/dam-image-block-fixture.service";
import { RichTextBlockFixtureService } from "./rich-text-block-fixture.service";

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
