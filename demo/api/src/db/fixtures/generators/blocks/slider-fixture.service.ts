import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker.js";
import type { SliderBlock } from "@src/documents/pages/blocks/slider.block.js";

import { MediaBlockFixtureService } from "./media/media-block.fixture.service.js";
import { RichTextBlockFixtureService } from "./text-and-content/rich-text-block-fixture.service.js";

@Injectable()
export class SliderBlockFixtureService {
    constructor(
        private readonly richTextBlockFixtureService: RichTextBlockFixtureService,
        private readonly mediaBlockFixtureService: MediaBlockFixtureService,
    ) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof SliderBlock>> {
        const blockAmount = faker.number.int({ min: 2, max: 6 });
        const blocks = [];

        for (let i = 0; i < blockAmount; i++) {
            blocks.push({
                key: faker.string.uuid(),
                visible: true,
                props: {
                    text: await this.richTextBlockFixtureService.generateBlockInput(),
                    media: await this.mediaBlockFixtureService.generateBlockInput(),
                },
            });
        }

        return {
            sliderList: {
                blocks,
            },
        };
    }
}
