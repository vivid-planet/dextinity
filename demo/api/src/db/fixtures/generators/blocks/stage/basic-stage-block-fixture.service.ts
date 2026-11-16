import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker.js";
import { Alignment as BasicStageBlockAlignment, type BasicStageBlock } from "@src/documents/pages/blocks/basic-stage.block.js";

import { MediaBlockFixtureService } from "../media/media-block.fixture.service.js";
import { CallToActionListBlockFixtureService } from "../navigation/call-to-action-list-block.service.js";
import { HeadingBlockFixtureService } from "../text-and-content/heading-block-fixture.service.js";
import { RichTextBlockFixtureService } from "../text-and-content/rich-text-block-fixture.service.js";

@Injectable()
export class BasicStageBlockFixtureService {
    constructor(
        private readonly callToActionListBlockFixtureService: CallToActionListBlockFixtureService,
        private readonly headingBlockFixtureService: HeadingBlockFixtureService,
        private readonly mediaBlockFixtureService: MediaBlockFixtureService,
        private readonly richTextBlockFixtureService: RichTextBlockFixtureService,
    ) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof BasicStageBlock>> {
        return {
            media: await this.mediaBlockFixtureService.generateBlockInput(),
            heading: await this.headingBlockFixtureService.generateBlockInput(),
            text: await this.richTextBlockFixtureService.generateBlockInput(),
            overlay: faker.number.int({ min: 50, max: 90 }),
            alignment: faker.helpers.arrayElement(Object.values(BasicStageBlockAlignment)),
            callToActionList: await this.callToActionListBlockFixtureService.generateBlockInput(),
        };
    }
}
