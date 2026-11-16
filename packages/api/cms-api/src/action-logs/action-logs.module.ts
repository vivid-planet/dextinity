import { MikroOrmModule } from "@mikro-orm/nestjs";
import type { DynamicModule } from "@nestjs/common";

import { DependenciesModule } from "../dependencies/dependencies.module.js";
import { ActionLogsAclService } from "./action-logs.acl.service.js";
import { ActionLogsResolver } from "./action-logs.resolver.js";
import { ActionLogsService } from "./action-logs.service.js";
import { ActionLogsSubscriber } from "./action-logs.subscriber.js";
import { ActionLogsUserLoaderService } from "./action-logs-user-loader.service.js";
import { ActionLog } from "./entities/action-log.entity.js";
import { PreviousActionLogLoaderService } from "./previous-action-log-loader.service.js";

export class ActionLogsModule {
    static forRoot(): DynamicModule {
        return {
            module: ActionLogsModule,
            imports: [MikroOrmModule.forFeature([ActionLog]), DependenciesModule],
            providers: [
                ActionLogsSubscriber,
                ActionLogsService,
                ActionLogsAclService,
                ActionLogsResolver,
                PreviousActionLogLoaderService,
                ActionLogsUserLoaderService,
            ],
        };
    }
}
