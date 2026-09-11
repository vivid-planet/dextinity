import { ExtractBlockInputFactoryProps, SitemapPageChangeFrequency, SitemapPagePriority } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker";
import { SeoBlock } from "@src/documents/pages/blocks/seo.block";

import { PixelImageBlockFixtureService } from "./blocks/media/pixel-image-block-fixture.service";

@Injectable()
export class SeoBlockFixtureService {
    constructor(private readonly pixelImageBlockFixtureService: PixelImageBlockFixtureService) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof SeoBlock>> {
        const alternativeLinks = [];
        const codes = ["en_US", "en_GB", "es_ES", "fr_FR", "ja_JP", "it_IT"];
        for (let i = 0; i < faker.number.int({ min: 0, max: 5 }); i++) {
            alternativeLinks.push({ code: codes[i], url: faker.internet.url() });
        }

        return {
            htmlTitle: faker.word.words(2),
            metaDescription: faker.word.words(20),
            openGraphTitle: faker.word.words(2),
            openGraphDescription: faker.word.words(20),
            openGraphImage: { block: await this.pixelImageBlockFixtureService.generateBlockInput(), visible: faker.datatype.boolean() },
            noIndex: faker.datatype.boolean(),
            priority: faker.helpers.arrayElement(Object.values(SitemapPagePriority)),
            changeFrequency: faker.helpers.arrayElement(Object.values(SitemapPageChangeFrequency)),
            alternativeLinks,
        };
    }
}
