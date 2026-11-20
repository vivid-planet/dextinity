import { DependenciesResolverFactory } from "@dextinity/cms-api";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { Page } from "./entities/page.entity.js";
import { PagesResolver } from "./pages.resolver.js";
import { PagesService } from "./pages.service.js";

@Module({
    imports: [MikroOrmModule.forFeature([Page])],
    providers: [PagesResolver, PagesService, DependenciesResolverFactory.create(Page)],
    exports: [PagesService],
})
export class PagesModule {}
