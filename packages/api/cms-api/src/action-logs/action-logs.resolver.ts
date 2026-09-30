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
import { ActionLogsAclService } from "./action-logs.acl.service";
import { ActionLogsService } from "./action-logs.service";
import { containsAllScopes } from "./contains-all-scopes";
import { ActionLogType } from "./dto/action-log-type.enum";
import { ActionLogsArgs } from "./dto/action-logs.args";
import { ActionLogsUser } from "./dto/action-logs-user";
import { AllActionLogsArgs } from "./dto/all-action-logs.args";
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
        private readonly actionLogsAclService: ActionLogsAclService,
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
        this.checkPermission({ entity, scope, user });

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

    @Query(() => PaginatedActionLogs, {
        description: "Returns the action log of all entities, restricted to the entries the user could read in the action log of each entity.",
    })
    @RequiredPermission("actionLog", { skipScopeCheck: true })
    async allActionLogs(
        @Args() { filter, offset, limit, sort }: AllActionLogsArgs,
        @GetCurrentUser() user: CurrentUser | SystemUser,
    ): Promise<PaginatedActionLogs> {
        const readableActionLogsFilter = this.actionLogsAclService.getReadableActionLogsFilter(user);
        if (readableActionLogsFilter === null) {
            return new PaginatedActionLogs([], 0);
        }

        const andFilters: ObjectQuery<ActionLog>[] = [readableActionLogsFilter];

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

    private checkPermission({ entity, scope, user }: { entity: string; scope: ContentScope; user: CurrentUser | SystemUser }): void {
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
        description:
            "The most recent earlier action log entry for the same entity. Null when this is the first version, or when the earlier entry is scoped and lacks one of this entry's scopes.",
    })
    async previousVersion(@Parent() actionLog: ActionLog): Promise<ActionLog | null> {
        if (actionLog.version <= 1) {
            return null;
        }
        const previous = await this.previousActionLogLoader.load(actionLog);
        if (!previous) {
            return null;
        }
        // An unscoped row is listed in every scope, so the user may read it anyway.
        if (previous.scope == null) {
            return previous;
        }
        // Access to a row is checked against one of its own scopes. A previous version that lacks one of the
        // current row's scopes could hold content the user may not read, so it is not returned.
        return containsAllScopes(previous.scope, actionLog.scope) ? previous : null;
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
