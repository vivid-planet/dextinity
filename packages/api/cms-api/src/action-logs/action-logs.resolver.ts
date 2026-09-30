import type { ObjectQuery } from "@mikro-orm/core/typings";
import { EntityManager, PostgreSqlDriver, raw } from "@mikro-orm/postgresql";
import { BadRequestException, ForbiddenException, Inject } from "@nestjs/common";
import { Args, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";

import { GetCurrentUser } from "../auth/decorators/get-current-user.decorator";
import { filtersToMikroOrmQuery, gqlSortToMikroOrmOrderBy } from "../common/filter/mikro-orm";
import {
    DisablePermissionCheck,
    REQUIRED_PERMISSION_METADATA_KEY,
    RequiredPermission,
    RequiredPermissionMetadata,
} from "../user-permissions/decorators/required-permission.decorator";
import { CurrentUser } from "../user-permissions/dto/current-user";
import { ContentScope } from "../user-permissions/interfaces/content-scope.interface";
import { ACCESS_CONTROL_SERVICE } from "../user-permissions/user-permissions.constants";
import { UserPermissionsService } from "../user-permissions/user-permissions.service";
import { AccessControlServiceInterface, Permission, SystemUser } from "../user-permissions/user-permissions.types";
import { ActionLogsService } from "./action-logs.service";
import { ActionLogType } from "./dto/action-log-type.enum";
import { ActionLogsArgs } from "./dto/action-logs.args";
import { ActionLogsUser } from "./dto/action-logs-user";
import { PaginatedActionLogs } from "./dto/paginated-action-logs";
import { ActionLog } from "./entities/action-log.entity";
import { PreviousActionLogLoaderService } from "./previous-action-log-loader.service";

@Resolver(() => ActionLog)
export class ActionLogsResolver {
    constructor(
        private readonly entityManager: EntityManager<PostgreSqlDriver>,
        private readonly userPermissionsService: UserPermissionsService,
        private readonly previousActionLogLoader: PreviousActionLogLoaderService,
        private readonly actionLogsService: ActionLogsService,
        @Inject(ACCESS_CONTROL_SERVICE) private readonly accessControlService: AccessControlServiceInterface,
    ) {}

    /**
     * The permission check cannot run in the guard: it depends on the `entity` argument, while the
     * guard resolves a permission statically from the resolver's entity binding. `DisablePermissionCheck`
     * therefore only gets past the guard — access is decided below, against the permission the
     * requested entity declares.
     */
    @Query(() => PaginatedActionLogs)
    @RequiredPermission(DisablePermissionCheck, { skipScopeCheck: true })
    async actionLogs(
        @Args() { entity, scope, filter, offset, limit, sort }: ActionLogsArgs,
        @GetCurrentUser() user: CurrentUser | SystemUser,
    ): Promise<PaginatedActionLogs> {
        this.checkPermission(entity, scope, user);

        const andFilters: ObjectQuery<ActionLog>[] = [{ entityName: entity }];

        // Action log rows for entities without a scope have scope=NULL; match those too so
        // unscoped entities still surface their logs when the page is rendered inside a scoped layout.
        // A scoped row must hold the requested scope exactly: `$contains` alone would also match a scope
        // with fewer dimensions, which passes the permission check for a user who holds only one of the
        // scopes it covers. `$contains` stays in the query for the GIN index.
        andFilters.push({
            $or: [
                { scope: null },
                {
                    scope: { $contains: [scope] },
                    [raw(
                        (alias) => `exists (select 1 from jsonb_array_elements(${alias}."scope") as "rowScope" where "rowScope" = ?::jsonb)`,
                        [JSON.stringify(scope)],
                    )]: true,
                },
            ],
        });

        if (filter) {
            andFilters.push(filtersToMikroOrmQuery(filter));
        }

        const [entities, totalCount] = await this.entityManager.findAndCount(
            ActionLog,
            { $and: andFilters },
            {
                offset,
                limit,
                orderBy: sort ? gqlSortToMikroOrmOrderBy(sort) : { createdAt: "DESC" },
            },
        );
        return new PaginatedActionLogs(entities, totalCount);
    }

    private checkPermission(entity: string, scope: ContentScope, user: CurrentUser | SystemUser): void {
        const loggedEntities = this.actionLogsService.getLoggedEntities();
        const entityClass = loggedEntities.find(({ name }) => name === entity);
        if (!entityClass) {
            const known = loggedEntities.map(({ name }) => name).join(", ");
            throw new BadRequestException(`"${entity}" is not logged. Entities decorated with @ActionLogs(): ${known || "none"}.`);
        }

        if (typeof user === "string" && this.userPermissionsService.isSystemUser(user)) {
            return;
        }

        const metadata = Reflect.getMetadata(REQUIRED_PERMISSION_METADATA_KEY, entityClass) as RequiredPermissionMetadata | undefined;
        const requiredPermissions = metadata?.requiredPermission ?? [];

        if (requiredPermissions.includes(DisablePermissionCheck)) {
            return;
        }

        const permissionScope = metadata?.options?.skipScopeCheck ? undefined : scope;
        const isAllowed = requiredPermissions
            .filter((permission): permission is Permission => permission !== DisablePermissionCheck)
            .some((permission) => this.accessControlService.isAllowed(user, permission, permissionScope));

        if (!isAllowed) {
            throw new ForbiddenException(`No permission to read the action log of ${entity} in this scope.`);
        }
    }

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
        if (this.userPermissionsService.isSystemUser(actionLog.userId)) {
            return { id: actionLog.userId, name: actionLog.userId };
        }
        const user = await this.userPermissionsService.findUser(actionLog.userId);
        return user ? { id: user.id, name: user.name } : { id: actionLog.userId };
    }
}
