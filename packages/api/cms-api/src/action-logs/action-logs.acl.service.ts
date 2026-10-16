import { EntityManager, type ObjectQuery, raw } from "@mikro-orm/postgresql";
import { ForbiddenException, Inject, Injectable } from "@nestjs/common";

import {
    DisablePermissionCheck,
    REQUIRED_PERMISSION_METADATA_KEY,
    type RequiredPermissionMetadata,
} from "../user-permissions/decorators/required-permission.decorator";
import type { CurrentUser } from "../user-permissions/dto/current-user";
import type { ContentScope } from "../user-permissions/interfaces/content-scope.interface";
import { ACCESS_CONTROL_SERVICE } from "../user-permissions/user-permissions.constants";
import { UserPermissionsService } from "../user-permissions/user-permissions.service";
import type { AccessControlServiceInterface, Permission, SystemUser } from "../user-permissions/user-permissions.types";
import { ActionLogsService } from "./action-logs.service";
import { ActionLog } from "./entities/action-log.entity";

@Injectable()
export class ActionLogsAclService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly actionLogsService: ActionLogsService,
        private readonly userPermissionsService: UserPermissionsService,
        @Inject(ACCESS_CONTROL_SERVICE) private readonly accessControlService: AccessControlServiceInterface,
    ) {}

    /**
     * Restricts the action log of all entities to the rows the user could also read through the log of each entity.
     * That log asks `isAllowed` for one requested scope and returns the rows of exactly that scope. `isAllowed` cannot
     * be translated into SQL, so it is asked here for each scope that occurs in the rows of a scoped entity.
     *
     * @returns `null` when the user can read no row.
     */
    async getReadableActionLogsFilter(user: CurrentUser | SystemUser): Promise<ObjectQuery<ActionLog> | null> {
        if (typeof user === "string") {
            if (this.userPermissionsService.isSystemUser(user)) {
                return {};
            }
            throw new ForbiddenException();
        }

        const entityFilters: ObjectQuery<ActionLog>[] = [];
        const scopedEntityPermissions = new Map<string, Permission[]>();

        for (const entityClass of this.actionLogsService.getLoggedEntities()) {
            const { requiredPermission, options } = Reflect.getMetadata(REQUIRED_PERMISSION_METADATA_KEY, entityClass) as RequiredPermissionMetadata;

            if (requiredPermission.includes(DisablePermissionCheck)) {
                entityFilters.push({ entityName: entityClass.name });
                continue;
            }

            const permissions = requiredPermission.filter((permission): permission is Permission => permission !== DisablePermissionCheck);

            if (options?.skipScopeCheck) {
                if (permissions.some((permission) => this.accessControlService.isAllowed(user, permission))) {
                    entityFilters.push({ entityName: entityClass.name });
                }
                continue;
            }

            scopedEntityPermissions.set(entityClass.name, permissions);
        }

        for (const [entityName, rowScopes] of await this.getRowScopes([...scopedEntityPermissions.keys()])) {
            const permissions = scopedEntityPermissions.get(entityName) ?? [];
            const allowedRowScopes = rowScopes.filter((rowScope) =>
                permissions.some((permission) => this.accessControlService.isAllowed(user, permission, rowScope)),
            );

            // The log of the single entity lists the unscoped rows in every scope it allows, so they are readable only
            // when the user is allowed in one of the scopes.
            if (allowedRowScopes.length === 0) {
                continue;
            }

            entityFilters.push({
                entityName,
                $or: [{ scope: null }, rowScopeEqualToAnyOf(allowedRowScopes)],
            });
        }

        return entityFilters.length > 0 ? { $or: entityFilters } : null;
    }

    private async getRowScopes(entityNames: string[]): Promise<Map<string, ContentScope[]>> {
        const rowScopes = new Map<string, ContentScope[]>();
        if (entityNames.length === 0) {
            return rowScopes;
        }

        const { tableName } = this.entityManager.getMetadata(ActionLog);
        const rows = await this.entityManager
            .getConnection()
            .execute<
                Array<{ entityName: string; rowScope: ContentScope }>
            >(`select distinct "entityName", "rowScope" from "${tableName}", jsonb_array_elements("scope") as "rowScope" where "entityName" in (?)`, [entityNames]);

        for (const { entityName, rowScope } of rows) {
            rowScopes.set(entityName, [...(rowScopes.get(entityName) ?? []), rowScope]);
        }
        return rowScopes;
    }
}

function rowScopeEqualToAnyOf(contentScopes: ContentScope[]): ObjectQuery<ActionLog> {
    return {
        [raw(
            (alias) =>
                `exists (select 1 from jsonb_array_elements(${alias}."scope") as "rowScope" where "rowScope" in (select jsonb_array_elements(?::jsonb)))`,
            [JSON.stringify(contentScopes)],
        )]: true,
    };
}
