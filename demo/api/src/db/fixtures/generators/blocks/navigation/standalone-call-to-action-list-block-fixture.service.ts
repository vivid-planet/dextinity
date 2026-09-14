import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import {
    Alignment as StandaloneCallToActionListBlockAlignment,
    StandaloneCallToActionListBlock,
} from "@src/common/blocks/standalone-call-to-action-list.block";
import { faker } from "@src/db/fixtures/faker";

import { CallToActionListBlockFixtureService } from "./call-to-action-list-block.service";

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
