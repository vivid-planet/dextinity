import { DamImageBlock } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable, Logger } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker";
import { NewsContentBlock } from "@src/news/blocks/news-content.block";
import { News, NewsCategory, NewsStatus } from "@src/news/entities/news.entity";

import { DamImageBlockFixtureService } from "./blocks/media/dam-image-block-fixture.service";

@Injectable()
export class NewsFixtureService {
    private logger = new Logger(NewsFixtureService.name);

    constructor(
        private readonly entityManager: EntityManager,
        private readonly damImageBlockFixtureService: DamImageBlockFixtureService,
    ) {}

    async generate(): Promise<void> {
        this.logger.log("Generating news...");

        for (let i = 0; i < 100; i++) {
            const title = faker.lorem.words({ min: 3, max: 5 });

            const news = this.entityManager.create(News, {
                scope: { domain: "main", language: "en" },
                title,
                slug: faker.helpers.slugify(title),
                status: NewsStatus.active,
                date: faker.date.past(),
                category: faker.helpers.arrayElement([NewsCategory.events, NewsCategory.company, NewsCategory.awards]),
                image: DamImageBlock.blockInputFactory(await this.damImageBlockFixtureService.generateBlockInput()).transformToBlockData(),
                content: NewsContentBlock.blockInputFactory({ blocks: [] }).transformToBlockData(),
            });

            this.entityManager.persist(news);
        }
    }
}
