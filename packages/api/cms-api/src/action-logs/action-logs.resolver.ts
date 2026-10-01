import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { UserPermissionsService } from "../user-permissions/user-permissions.service";
import { containsAllScopes } from "./contains-all-scopes";
import { ActionLogType } from "./dto/action-log-type.enum";
import { ActionLogsUser } from "./dto/action-logs-user";
import { ActionLog } from "./entities/action-log.entity";
import { PreviousActionLogLoaderService } from "./previous-action-log-loader.service";

@Resolver(() => ActionLog)
export class ActionLogsResolver {
    constructor(
        private readonly userPermissionsService: UserPermissionsService,
        private readonly previousActionLogLoader: PreviousActionLogLoaderService,
    ) {}

    @ResolveField(() => ActionLog, {
        nullable: true,
        description:
            "The most recent earlier action log entry for the same entity. Null when this is the first version, or when the earlier entry lacks one of this entry's scopes.",
    })
    async previousVersion(@Parent() actionLog: ActionLog): Promise<ActionLog | null> {
        if (actionLog.version <= 1) {
            return null;
        }
        const previous = await this.previousActionLogLoader.load(actionLog);
        // Access to a row is checked against one of its own scopes. A previous version that lacks one of the
        // current row's scopes could hold content the user may not read, so it is not returned.
        return previous && containsAllScopes(previous.scope, actionLog.scope) ? previous : null;
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
        if (this.userPermissionsService.isSystemUser(actionLog.userId)) {
            return { id: actionLog.userId, name: actionLog.userId };
        }
        const user = await this.userPermissionsService.findUser(actionLog.userId);
        return user ? { id: user.id, name: user.name } : { id: actionLog.userId };
    }
}
