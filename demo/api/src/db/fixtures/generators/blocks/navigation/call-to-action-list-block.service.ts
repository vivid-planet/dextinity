import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { CallToActionListBlock } from "@src/common/blocks/call-to-action-list.block";
import { faker } from "@src/db/fixtures/faker";

import { CallToActionBlockFixtureService } from "./call-to-action-block-fixture.service";

@Injectable()
export class CallToActionListBlockFixtureService {
    constructor(private readonly callToActionBlockFixtureService: CallToActionBlockFixtureService) {}

    async generateBlockInput(min = 2, max = 6): Promise<ExtractBlockInputFactoryProps<typeof CallToActionListBlock>> {
        const blockAmount = faker.number.int({ min, max });
        const blocks = [];

        for (let i = 0; i < blockAmount; i++) {
            blocks.push({
                key: faker.string.uuid(),
                visible: true,
                props: await this.callToActionBlockFixtureService.generateBlockInput(),
            });
        }

        return {
            blocks: blocks,
        };
    }
}
