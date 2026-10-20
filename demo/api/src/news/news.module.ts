import { DependenciesResolverFactory, DependentsResolverFactory } from "@dextinity/cms-api";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { News, NewsContentScope } from "@src/news/entities/news.entity.js";

import { NewsLinkBlockTransformerService } from "./blocks/news-link-block-transformer.service.js";
import { NewsComment } from "./entities/news-comment.entity.js";
import { ExtendedNewsResolver } from "./extended-news.resolver.js";
import { NewsResolver } from "./generated/news.resolver.js";
import { NewsCommentResolver } from "./news-comment.resolver.js";
import { NewsFieldResolver } from "./news-field.resolver.js";

@Module({
    imports: [MikroOrmModule.forFeature([News, NewsComment, NewsContentScope])],
    providers: [
        NewsResolver,
        NewsCommentResolver,
        NewsFieldResolver,
        DependenciesResolverFactory.create(News),
        DependentsResolverFactory.create(News),
        NewsLinkBlockTransformerService,
        ExtendedNewsResolver,
    ],
    exports: [],
})
export class NewsModule {}
