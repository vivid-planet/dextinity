import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Global, Module } from "@nestjs/common";

import { EntityInfoModule } from "../entity-info/entity-info.module";
import { EntityInfoFullTextObject } from "./entities/entity-info-full-text.object";
import { FullTextSearchResolver } from "./full-text-search.resolver";
import { FullTextSearchService } from "./full-text-search.service";
import { FullTextSearchQueryService } from "./full-text-search-query.service";
import { FullTextSnippetService } from "./full-text-snippet.service";

/** @experimental */
@Global()
@Module({
    imports: [EntityInfoModule, MikroOrmModule.forFeature([EntityInfoFullTextObject])],
    providers: [FullTextSearchService, FullTextSearchQueryService, FullTextSnippetService, FullTextSearchResolver],
    exports: [FullTextSearchService, FullTextSearchQueryService, FullTextSnippetService],
})
export class FullTextSearchModule {}
