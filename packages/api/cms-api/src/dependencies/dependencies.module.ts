import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Global, Module } from "@nestjs/common";

import { EntityInfoModule } from "../entity-info/entity-info.module";
import { DependenciesService } from "./dependencies.service";
import { DependencyResolver } from "./dependency.resolver";
import { DependencyScopeLoaderService } from "./dependency-scope-loader.service";
import { DiscoverService } from "./discover.service";
import { BlockIndexDependencyObject } from "./entities/block-index-dependency.object";
import { BlockIndexRefresh } from "./entities/block-index-refresh.entity";

@Global()
@Module({
    imports: [MikroOrmModule.forFeature([BlockIndexRefresh, BlockIndexDependencyObject]), EntityInfoModule],
    providers: [DiscoverService, DependenciesService, DependencyScopeLoaderService, DependencyResolver],
    exports: [DiscoverService, DependenciesService],
})
export class DependenciesModule {}
