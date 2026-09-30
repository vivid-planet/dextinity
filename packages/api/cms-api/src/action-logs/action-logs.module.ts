import { MikroOrmModule } from "@mikro-orm/nestjs";
import type { AnyEntity } from "@mikro-orm/postgresql";
import type { DynamicModule, Type } from "@nestjs/common";

import { ActionLogsResolver } from "./action-logs.resolver";
import { ActionLogsResolverFactory } from "./action-logs.resolver.factory";
import { ActionLogsService } from "./action-logs.service";
import { ActionLogsSubscriber } from "./action-logs.subscriber";
import { ActionLogsFeatureModule } from "./action-logs-feature.module";
import { ActionLogsUserLoaderService } from "./action-logs-user-loader.service";
import { ActionLog } from "./entities/action-log.entity";
import { PreviousActionLogLoaderService } from "./previous-action-log-loader.service";

export class ActionLogsModule {
    static forRoot(): DynamicModule {
        return {
            module: ActionLogsModule,
            imports: [MikroOrmModule.forFeature([ActionLog])],
            providers: [ActionLogsSubscriber, ActionLogsService, ActionLogsResolver, PreviousActionLogLoaderService, ActionLogsUserLoaderService],
        };
    }

    static forFeature(entities: Array<Type<AnyEntity>>): DynamicModule {
        const resolvers = entities.map((entity) => ActionLogsResolverFactory.create(entity));
        return {
            module: ActionLogsFeatureModule,
            providers: [...resolvers],
        };
    }
}
