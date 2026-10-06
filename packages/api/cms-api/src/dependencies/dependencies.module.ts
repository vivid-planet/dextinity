import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Global, Module } from "@nestjs/common";

import { EntityInfoModule } from "../entity-info/entity-info.module.js";
import { DependenciesService } from "./dependencies.service.js";
import { DiscoverService } from "./discover.service.js";
import { BlockIndexDependencyObject } from "./entities/block-index-dependency.object.js";
import { BlockIndexRefresh } from "./entities/block-index-refresh.entity.js";

@Global()
@Module({
    imports: [MikroOrmModule.forFeature([BlockIndexRefresh, BlockIndexDependencyObject]), EntityInfoModule],
    providers: [DiscoverService, DependenciesService],
    exports: [DiscoverService, DependenciesService],
})
export class DependenciesModule {}
