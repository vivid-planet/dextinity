import { BlockTransformerServiceInterface, resolveEntityClass } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import type { News } from "../entities/news.entity";
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

        // The entity is resolved by name because importing it here would create a circular import
        // (news entity -> news content block -> rich text block -> link block -> news link block).
        const news = await this.entityManager.findOneOrFail(resolveEntityClass<News>("News"), block.id);

        return {
            news: {
                id: news.id,
                slug: news.slug,
                scope: news.scope,
            },
        };
    }
}
