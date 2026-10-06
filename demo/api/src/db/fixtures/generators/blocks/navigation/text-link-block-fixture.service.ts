import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import type { TextLinkBlock } from "@src/common/blocks/text-link.block.js";
import { faker } from "@src/db/fixtures/faker.js";

import { LinkBlockFixtureService } from "./link-block-fixture.service.js";

@Injectable()
export class TextLinkBlockFixtureService {
    constructor(private readonly linkBlockFixtureService: LinkBlockFixtureService) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof TextLinkBlock>> {
        return {
            link: await this.linkBlockFixtureService.generateBlockInput(),
            text: faker.lorem.words({ min: 1, max: 3 }),
        };
    }
}
