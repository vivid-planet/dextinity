import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { type CallToActionBlock, Variant as CallToActionVariant } from "@src/common/blocks/call-to-action.block.js";
import { faker } from "@src/db/fixtures/faker.js";

import { TextLinkBlockFixtureService } from "./text-link-block-fixture.service.js";

@Injectable()
export class CallToActionBlockFixtureService {
    constructor(private readonly textLinkBlockFixtureService: TextLinkBlockFixtureService) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof CallToActionBlock>> {
        return {
            textLink: await this.textLinkBlockFixtureService.generateBlockInput(),
            variant: faker.helpers.arrayElement(Object.values(CallToActionVariant)),
        };
    }
}
