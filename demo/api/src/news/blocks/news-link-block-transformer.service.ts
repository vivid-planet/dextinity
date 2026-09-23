import { BlockTransformerServiceInterface } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Inject, Injectable } from "@nestjs/common";

import type { News } from "../entities/news.entity";
import { NEWS_ENTITY } from "./news-entity.token";
import { NewsLinkBlockData } from "./news-link.block";

type TransformResponse = {
    news?: {
        id: string;
        slug: string;
        scope: {
            domain: string;
            language: string;
        };
    };
};

@Injectable()
export class NewsLinkBlockTransformerService implements BlockTransformerServiceInterface<NewsLinkBlockData, TransformResponse> {
    constructor(
        private readonly entityManager: EntityManager,
        @Inject(NEWS_ENTITY) private readonly newsEntity: typeof News,
    ) {}

    async transformToPlain(block: NewsLinkBlockData) {
        if (!block.id) {
            return {};
        }

        const news = await this.entityManager.findOneOrFail(this.newsEntity, block.id);

        return {
            news: {
                id: news.id,
                slug: news.slug,
                scope: news.scope,
            },
        };
    }
}
