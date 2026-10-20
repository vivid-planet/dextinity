import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import type { MediaGalleryBlock, MediaGalleryListBlock } from "@src/common/blocks/media-gallery.block.js";
import type { MediaGalleryItemBlock } from "@src/common/blocks/media-gallery-item.block.js";
import { faker } from "@src/db/fixtures/faker.js";
import { MediaAspectRatios } from "@src/util/mediaAspectRatios.js";

import { MediaBlockFixtureService } from "./media-block.fixture.service.js";

@Injectable()
export class MediaGalleryBlockFixtureService {
    constructor(private readonly mediaBlockFixtureService: MediaBlockFixtureService) {}

    async generateMediaGalleryItemBlock(): Promise<ExtractBlockInputFactoryProps<typeof MediaGalleryItemBlock>> {
        return {
            media: await this.mediaBlockFixtureService.generateBlockInput(),
            caption: faker.lorem.words({ min: 3, max: 9 }),
        };
    }

    async generateMediaGalleryListBlock(min = 2, max = 6): Promise<ExtractBlockInputFactoryProps<typeof MediaGalleryListBlock>> {
        const blockAmount = faker.number.int({ min, max });
        const blocks = [];

        for (let i = 0; i < blockAmount; i++) {
            blocks.push({
                key: faker.string.uuid(),
                visible: true,
                props: await this.generateMediaGalleryItemBlock(),
            });
        }

        return {
            blocks: blocks,
        };
    }

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof MediaGalleryBlock>> {
        return {
            aspectRatio: faker.helpers.arrayElement(Object.values(MediaAspectRatios)),
            items: await this.generateMediaGalleryListBlock(),
        };
    }
}
