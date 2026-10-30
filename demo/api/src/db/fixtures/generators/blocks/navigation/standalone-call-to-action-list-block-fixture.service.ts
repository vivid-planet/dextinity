import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import {
    Alignment as StandaloneCallToActionListBlockAlignment,
    type StandaloneCallToActionListBlock,
} from "@src/common/blocks/standalone-call-to-action-list.block.js";
import { faker } from "@src/db/fixtures/faker.js";

import { CallToActionListBlockFixtureService } from "./call-to-action-list-block.service.js";

@Injectable()
export class StandaloneCallToActionListBlockFixtureService {
    constructor(private readonly callToActionListBlockFixtureService: CallToActionListBlockFixtureService) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof StandaloneCallToActionListBlock>> {
        return {
            alignment: faker.helpers.arrayElement(Object.values(StandaloneCallToActionListBlockAlignment)),
            callToActionList: await this.callToActionListBlockFixtureService.generateBlockInput(),
        };
    }
}
