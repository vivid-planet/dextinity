import { type ObjectQuery, raw } from "@mikro-orm/postgresql";
import { ForbiddenException, Injectable } from "@nestjs/common";

import {
    DisablePermissionCheck,
    REQUIRED_PERMISSION_METADATA_KEY,
    type RequiredPermissionMetadata,
} from "../user-permissions/decorators/required-permission.decorator";
import type { CurrentUser } from "../user-permissions/dto/current-user";
import type { ContentScope } from "../user-permissions/interfaces/content-scope.interface";
import { UserPermissionsService } from "../user-permissions/user-permissions.service";
import type { SystemUser } from "../user-permissions/user-permissions.types";
import { ActionLogsService } from "./action-logs.service";
import type { ActionLog } from "./entities/action-log.entity";

@Injectable()
export class ActionLogsAclService {
    constructor(
        private readonly actionLogsService: ActionLogsService,
        private readonly userPermissionsService: UserPermissionsService,
    ) {}

    /**
     * Restricts the action log of all entities to the rows the user could also read through the log of each entity:
     * the entity's `@RequiredPermission` held in a content scope of the row. `isAllowed` answers this only for one
     * scope at a time, so the grants are read from the user and translated into SQL, as `myFullTextSearch` does.
     *
     * @returns `null` when the user can read no row.
     */
    getReadableActionLogsFilter(user: CurrentUser | SystemUser): ObjectQuery<ActionLog> | null {
        if (typeof user === "string") {
            if (this.userPermissionsService.isSystemUser(user)) {
                return {};
            }
            throw new ForbiddenException();
        }

        const entityFilters: ObjectQuery<ActionLog>[] = [];

        for (const entityClass of this.actionLogsService.getLoggedEntities()) {
            const { requiredPermission, options } = Reflect.getMetadata(REQUIRED_PERMISSION_METADATA_KEY, entityClass) as RequiredPermissionMetadata;

            if (requiredPermission.includes(DisablePermissionCheck)) {
                entityFilters.push({ entityName: entityClass.name });
                continue;
            }

            const grants = user.permissions.filter(({ permission }) => requiredPermission.includes(permission));
            if (grants.length === 0) {
                continue;
            }

            if (options?.skipScopeCheck) {
                entityFilters.push({ entityName: entityClass.name });
                continue;
            }

            // The log of the single entity checks the permission for a requested scope, so a grant without any content
            // scope reads no row there, not even the unscoped ones.
            const contentScopes = grants.flatMap(({ contentScopes }) => contentScopes);
            if (contentScopes.length === 0) {
                continue;
            }

            entityFilters.push({
                entityName: entityClass.name,
                $or: [{ scope: null }, rowScopeWithinAnyOf(contentScopes)],
            });
        }

        return entityFilters.length > 0 ? { $or: entityFilters } : null;
    }
}

/**
 * Matches a row when one of its scopes lies within one of `contentScopes`, following `isScopeWithin`: every
 * dimension of the row scope must equal the dimension of the content scope, unless the content scope holds the
 * wildcard `"*"` for it. Removing the wildcard dimensions from the row scope turns this into jsonb containment.
 */
function rowScopeWithinAnyOf(contentScopes: ContentScope[]): ObjectQuery<ActionLog> {
    const conditions: string[] = [];
    const params: string[] = [];

    for (const contentScope of contentScopes) {
        const dimensions = Object.entries(contentScope);
        const wildcardDimensions = dimensions.filter(([, value]) => value === "*").map(([dimension]) => dimension);
        const fixedDimensions = Object.fromEntries(dimensions.filter(([, value]) => value !== "*"));

        conditions.push(`("rowScope"${" - ?::text".repeat(wildcardDimensions.length)}) <@ ?::jsonb`);
        params.push(...wildcardDimensions, JSON.stringify(fixedDimensions));
    }

    return {
        [raw((alias) => `exists (select 1 from jsonb_array_elements(${alias}."scope") as "rowScope" where ${conditions.join(" or ")})`, params)]:
            true,
    };
}
