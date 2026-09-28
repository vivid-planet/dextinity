import { MikroOrmModule } from "@mikro-orm/nestjs";
import type { DynamicModule } from "@nestjs/common";

import { REQUIRED_PERMISSION_METADATA_KEY } from "../user-permissions/decorators/required-permission.decorator";
import { getActionLogEntities } from "./action-logs.decorator";
import { ActionLogsResolver } from "./action-logs.resolver";
import { ActionLogsService } from "./action-logs.service";
import { ActionLogsSubscriber } from "./action-logs.subscriber";
import { ActionLog } from "./entities/action-log.entity";
import { PreviousActionLogLoaderService } from "./previous-action-log-loader.service";

export class ActionLogsModule {
    static forRoot(): DynamicModule {
        for (const entity of getActionLogEntities()) {
            if (!Reflect.getMetadata(REQUIRED_PERMISSION_METADATA_KEY, entity)) {
                throw new Error(
                    `${entity.name} is decorated with @ActionLogs() but is missing a @RequiredPermission decorator. The actionLogs query decides access from the entity's permission.`,
                );
            }
        }

        return {
            module: ActionLogsModule,
            imports: [MikroOrmModule.forFeature([ActionLog])],
            providers: [ActionLogsSubscriber, ActionLogsService, ActionLogsResolver, PreviousActionLogLoaderService],
        };
    }
}
