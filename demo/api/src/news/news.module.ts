import { DependenciesResolverFactory, DependentsResolverFactory } from "@dextinity/cms-api";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { News, NewsContentScope } from "@src/news/entities/news.entity";

import { NewsLinkBlockNewsLoader } from "./blocks/news-link-block-news-loader";
import { NewsLinkBlockTransformerService } from "./blocks/news-link-block-transformer.service";
import { NewsComment } from "./entities/news-comment.entity";
import { ExtendedNewsResolver } from "./extended-news.resolver";
import { NewsResolver } from "./generated/news.resolver";
import { NewsCommentResolver } from "./news-comment.resolver";
import { NewsFieldResolver } from "./news-field.resolver";
import { NewsLinkBlockNewsLoaderService } from "./news-link-block-news-loader.service";

@Module({
    imports: [MikroOrmModule.forFeature([News, NewsComment, NewsContentScope])],
    providers: [
        NewsResolver,
        NewsCommentResolver,
        NewsFieldResolver,
        DependenciesResolverFactory.create(News),
        DependentsResolverFactory.create(News),
        NewsLinkBlockTransformerService,
        { provide: NewsLinkBlockNewsLoader, useClass: NewsLinkBlockNewsLoaderService },
        ExtendedNewsResolver,
    ],
    exports: [],
})
export class NewsModule {}
