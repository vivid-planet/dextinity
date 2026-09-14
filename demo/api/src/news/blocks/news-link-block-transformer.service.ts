import { BlockTransformerServiceInterface } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import { News } from "../entities/news.entity";
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
    constructor(private readonly entityManager: EntityManager) {}

    async transformToPlain(block: NewsLinkBlockData) {
        if (!block.id) {
            return {};
        }

        const news = await this.entityManager.findOneOrFail<News>("News", block.id);

        return {
            news: {
                id: news.id,
                slug: news.slug,
                scope: news.scope,
            },
        };
    }
}
