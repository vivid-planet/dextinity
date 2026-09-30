import { MikroOrmModule } from "@mikro-orm/nestjs";
import type { DynamicModule } from "@nestjs/common";

import { ActionLogsResolver } from "./action-logs.resolver";
import { ActionLogsService } from "./action-logs.service";
import { ActionLogsSubscriber } from "./action-logs.subscriber";
import { ActionLog } from "./entities/action-log.entity";
import { PreviousActionLogLoaderService } from "./previous-action-log-loader.service";

export class ActionLogsModule {
    static forRoot(): DynamicModule {
        return {
            module: ActionLogsModule,
            imports: [MikroOrmModule.forFeature([ActionLog])],
            providers: [ActionLogsSubscriber, ActionLogsService, ActionLogsResolver, PreviousActionLogLoaderService],
        };
    }
}
