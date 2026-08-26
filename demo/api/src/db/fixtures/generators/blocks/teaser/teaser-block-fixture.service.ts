import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker";
import { TeaserBlock } from "@src/documents/pages/blocks/teaser.block";
import { TeaserItemBlock, TeaserItemTitleHtmlTag } from "@src/documents/pages/blocks/teaser-item.block";

import { MediaBlockFixtureService } from "../media/media-block.fixture.service";
import { TextLinkBlockFixtureService } from "../navigation/text-link-block-fixture.service";
import { RichTextBlockFixtureService } from "../text-and-content/rich-text-block-fixture.service";

@Injectable()
export class TeaserBlockFixtureService {
    constructor(
        private readonly mediaBlockFixtureService: MediaBlockFixtureService,
        private readonly richTextBlockFixtureService: RichTextBlockFixtureService,
        private readonly textLinkBlockFixtureService: TextLinkBlockFixtureService,
    ) {}

    async generateTeaserItemBlock(): Promise<ExtractBlockInputFactoryProps<typeof TeaserItemBlock>> {
        return {
            media: await this.mediaBlockFixtureService.generateBlockInput(),
            title: faker.lorem.words({ min: 3, max: 9 }),
            description: await this.richTextBlockFixtureService.generateBlockInput(),
            link: await this.textLinkBlockFixtureService.generateBlockInput(),
            titleHtmlTag: faker.helpers.arrayElement(Object.values(TeaserItemTitleHtmlTag)),
        };
    }

    async generateBlockInput(min = 2, max = 6): Promise<ExtractBlockInputFactoryProps<typeof TeaserBlock>> {
        const blockAmount = faker.number.int({ min, max });
        const blocks = [];

        for (let i = 0; i < blockAmount; i++) {
            blocks.push({
                key: faker.string.uuid(),
                visible: true,
                props: await this.generateTeaserItemBlock(),
            });
        }

        return {
            blocks: blocks,
        };
    }
}
