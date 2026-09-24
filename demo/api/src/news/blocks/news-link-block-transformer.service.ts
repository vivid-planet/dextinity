import { BlockTransformerServiceInterface } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";

import { NewsLinkBlockData } from "./news-link.block";
import { NewsLinkBlockNewsLoader } from "./news-link-block-news-loader";

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
    constructor(private readonly newsLoader: NewsLinkBlockNewsLoader) {}

    async transformToPlain(block: NewsLinkBlockData) {
        if (!block.id) {
            return {};
        }

        const news = await this.newsLoader.load(block.id);

        return {
            news: {
                id: news.id,
                slug: news.slug,
                scope: news.scope,
            },
        };
    }
}
