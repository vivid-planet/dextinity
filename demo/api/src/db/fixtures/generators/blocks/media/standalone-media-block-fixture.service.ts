import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import type { StandaloneMediaBlock } from "@src/common/blocks/standalone-media.block.js";
import { faker } from "@src/db/fixtures/faker.js";
import { MediaAspectRatios } from "@src/util/mediaAspectRatios.js";

import { MediaBlockFixtureService } from "./media-block.fixture.service.js";

@Injectable()
export class StandaloneMediaBlockFixtureService {
    constructor(private readonly mediaBlockFixtureService: MediaBlockFixtureService) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof StandaloneMediaBlock>> {
        return {
            media: await this.mediaBlockFixtureService.generateBlockInput(),
            aspectRatio: faker.helpers.arrayElement(Object.values(MediaAspectRatios)),
        };
    }
}
