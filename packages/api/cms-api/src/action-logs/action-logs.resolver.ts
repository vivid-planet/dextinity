import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { ActionLogsUserLoaderService } from "./action-logs-user-loader.service";
import { ActionLogType } from "./dto/action-log-type.enum";
import { ActionLogsUser } from "./dto/action-logs-user";
import { ActionLog } from "./entities/action-log.entity";
import { PreviousActionLogLoaderService } from "./previous-action-log-loader.service";

@Resolver(() => ActionLog)
export class ActionLogsResolver {
    constructor(
        private readonly previousActionLogLoader: PreviousActionLogLoaderService,
        private readonly actionLogsUserLoader: ActionLogsUserLoaderService,
    ) {}

    @ResolveField(() => ActionLog, {
        nullable: true,
        description: "The most recent earlier action log entry for the same entity. Null when this is the first version.",
    })
    async previousVersion(@Parent() actionLog: ActionLog): Promise<ActionLog | null> {
        if (actionLog.version <= 1) {
            return null;
        }
        return this.previousActionLogLoader.load(actionLog);
    }

    @ResolveField(() => ActionLogType, {
        description: "Derived from snapshot and version: snapshot null → Deleted, version 1 → Created, otherwise → Updated.",
    })
    type(@Parent() actionLog: ActionLog): ActionLogType {
        if (actionLog.snapshot == null) {
            return ActionLogType.Deleted;
        }
        if (actionLog.version === 1) {
            return ActionLogType.Created;
        }
        return ActionLogType.Updated;
    }

    @ResolveField(() => ActionLogsUser)
    async user(@Parent() actionLog: ActionLog): Promise<ActionLogsUser> {
        return this.actionLogsUserLoader.load(actionLog.userId);
    }
}
