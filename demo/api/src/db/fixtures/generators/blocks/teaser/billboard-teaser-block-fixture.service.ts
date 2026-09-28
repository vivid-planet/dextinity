import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker";
import { BillboardTeaserBlock } from "@src/documents/pages/blocks/billboard-teaser.block";

import { MediaBlockFixtureService } from "../media/media-block.fixture.service";
import { CallToActionListBlockFixtureService } from "../navigation/call-to-action-list-block.service";
import { HeadingBlockFixtureService } from "../text-and-content/heading-block-fixture.service";
import { RichTextBlockFixtureService } from "../text-and-content/rich-text-block-fixture.service";

@Injectable()
export class BillboardTeaserBlockFixtureService {
    constructor(
        private readonly callToActionListBlockFixtureService: CallToActionListBlockFixtureService,
        private readonly headingBlockFixtureService: HeadingBlockFixtureService,
        private readonly mediaBlockFixtureService: MediaBlockFixtureService,
        private readonly richTextBlockFixtureService: RichTextBlockFixtureService,
    ) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof BillboardTeaserBlock>> {
        return {
            media: await this.mediaBlockFixtureService.generateBlockInput(),
            heading: await this.headingBlockFixtureService.generateBlockInput(),
            text: await this.richTextBlockFixtureService.generateBlockInput(),
            overlay: faker.number.int({ min: 50, max: 90 }),
            callToActionList: await this.callToActionListBlockFixtureService.generateBlockInput(),
        };
    }
}
