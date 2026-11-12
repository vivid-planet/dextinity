import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker.js";
import type { BillboardTeaserBlock } from "@src/documents/pages/blocks/billboard-teaser.block.js";

import { MediaBlockFixtureService } from "../media/media-block.fixture.service.js";
import { CallToActionListBlockFixtureService } from "../navigation/call-to-action-list-block.service.js";
import { HeadingBlockFixtureService } from "../text-and-content/heading-block-fixture.service.js";
import { TipTapRichTextBlockFixtureService } from "../text-and-content/tip-tap-rich-text-block-fixture.service.js";

@Injectable()
export class BillboardTeaserBlockFixtureService {
    constructor(
        private readonly callToActionListBlockFixtureService: CallToActionListBlockFixtureService,
        private readonly headingBlockFixtureService: HeadingBlockFixtureService,
        private readonly mediaBlockFixtureService: MediaBlockFixtureService,
        private readonly tipTapRichTextBlockFixtureService: TipTapRichTextBlockFixtureService,
    ) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof BillboardTeaserBlock>> {
        return {
            media: await this.mediaBlockFixtureService.generateBlockInput(),
            heading: await this.headingBlockFixtureService.generateBlockInput(),
            text: await this.tipTapRichTextBlockFixtureService.generateBlockInput(),
            overlay: faker.number.int({ min: 50, max: 90 }),
            callToActionList: await this.callToActionListBlockFixtureService.generateBlockInput(),
        };
    }
}
