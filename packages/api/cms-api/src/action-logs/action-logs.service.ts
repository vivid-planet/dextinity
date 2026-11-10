import { type AnyEntity, EntityManager, type EntityMetadata, type EntityName } from "@mikro-orm/postgresql";
import { Injectable, type OnModuleInit, type Type } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";

import { DiscoverService } from "../dependencies/discover.service";
import {
    DisablePermissionCheck,
    REQUIRED_PERMISSION_METADATA_KEY,
    type RequiredPermissionMetadata,
} from "../user-permissions/decorators/required-permission.decorator";
import { SCOPED_ENTITY_METADATA_KEY, type ScopedEntityMeta } from "../user-permissions/decorators/scoped-entity.decorator";
import { getScopesForScopedEntity } from "../user-permissions/get-scopes-for-scoped-entity";
import type { ContentScope } from "../user-permissions/interfaces/content-scope.interface";
import { ACTION_LOGS_METADATA_KEY } from "./action-logs.decorator";

@Injectable()
export class ActionLogsService implements OnModuleInit {
    private loggedEntities: Array<Type<AnyEntity>> = [];

    constructor(
        private readonly moduleRef: ModuleRef,
        private readonly entityManager: EntityManager,
        private readonly discoverService: DiscoverService,
    ) {}

    onModuleInit(): void {
        const loggedTargetEntities = this.discoverService
            .discoverTargetEntities()
            .filter(({ entity }) => Reflect.hasOwnMetadata(ACTION_LOGS_METADATA_KEY, entity.prototype));
        this.loggedEntities = loggedTargetEntities.map(({ entity }) => entity as Type<AnyEntity>);

        for (const { entity, metadata } of loggedTargetEntities) {
            const permissionMetadata = Reflect.getMetadata(REQUIRED_PERMISSION_METADATA_KEY, entity) as RequiredPermissionMetadata | undefined;
            if (!permissionMetadata) {
                throw new Error(
                    `${entity.name} is decorated with @ActionLogs() but is missing a @RequiredPermission decorator. The actionLogs query decides access from the entity's permission.`,
                );
            }

            const checksScope =
                !permissionMetadata.requiredPermission.includes(DisablePermissionCheck) && !permissionMetadata.options?.skipScopeCheck;
            if (checksScope && !hasScope(entity, metadata)) {
                throw new Error(
                    `${entity.name} is decorated with @ActionLogs() and its @RequiredPermission checks the scope, but ${entity.name} has no scope. Add a scope property or @ScopedEntity, or set skipScopeCheck in @RequiredPermission.`,
                );
            }
        }
    }

    getLoggedEntities(): ReadonlyArray<Type<AnyEntity>> {
        return this.loggedEntities;
    }

    async getScopeFromEntity<T extends AnyEntity>(entity: T): Promise<ContentScope[] | undefined> {
        if ("scope" in entity) {
            return toScopes(entity.scope);
        }
        const scoped = Reflect.getMetadata(SCOPED_ENTITY_METADATA_KEY, entity.constructor) as ScopedEntityMeta | undefined;
        if (scoped) {
            const scopedEntityScope = await getScopesForScopedEntity({
                scoped,
                entity: entity.constructor as EntityName<AnyEntity>,
                row: entity,
                entityManager: this.entityManager,
                moduleRef: this.moduleRef,
            });
            return toScopes(scopedEntityScope);
        }
        return undefined;
    }
}

// A missing scope is stored as no scope and never as an array holding null: `isAllowed` passes for a null scope.
function toScopes(scope: ContentScope | Array<ContentScope | null | undefined> | null | undefined): ContentScope[] | undefined {
    const scopes = (Array.isArray(scope) ? scope : [scope]).filter((item): item is ContentScope => item != null);
    return scopes.length > 0 ? scopes : undefined;
}

function hasScope(entity: object, metadata: EntityMetadata): boolean {
    return "scope" in metadata.properties || Reflect.hasMetadata(SCOPED_ENTITY_METADATA_KEY, entity);
}
