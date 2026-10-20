import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { type StandaloneHeadingBlock, TextAlignment } from "@src/common/blocks/standalone-heading.block.js";
import { faker } from "@src/db/fixtures/faker.js";

import { HeadingBlockFixtureService } from "./heading-block-fixture.service.js";

@Injectable()
export class StandaloneHeadingBlockFixtureService {
    constructor(private readonly headingBlockFixtureService: HeadingBlockFixtureService) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof StandaloneHeadingBlock>> {
        return {
            heading: await this.headingBlockFixtureService.generateBlockInput(),
            textAlignment: faker.helpers.arrayElement(Object.values(TextAlignment)),
        };
    }
}
