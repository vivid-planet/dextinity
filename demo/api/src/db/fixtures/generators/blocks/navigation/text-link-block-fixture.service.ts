import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { TextLinkBlock } from "@src/common/blocks/text-link.block";
import { faker } from "@src/db/fixtures/faker";

import { LinkBlockFixtureService } from "./link-block-fixture.service";

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
