import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Global, Module } from "@nestjs/common";

import { EntityInfoModule } from "../entity-info/entity-info.module.js";
import { EntityInfoFullTextObject } from "./entities/entity-info-full-text.object.js";
import { FullTextSearchResolver } from "./full-text-search.resolver.js";
import { FullTextSearchService } from "./full-text-search.service.js";

/** @experimental */
@Global()
@Module({
    imports: [EntityInfoModule, MikroOrmModule.forFeature([EntityInfoFullTextObject])],
    providers: [FullTextSearchService, FullTextSearchResolver],
    exports: [FullTextSearchService],
})
export class FullTextSearchModule {}
