import { type AnyEntity, EntityManager, type EntityName } from "@mikro-orm/postgresql";
import { Injectable, type OnModuleInit, type Type } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";

import { DiscoverService } from "../dependencies/discover.service";
import { REQUIRED_PERMISSION_METADATA_KEY } from "../user-permissions/decorators/required-permission.decorator";
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
        this.loggedEntities = this.discoverService
            .discoverTargetEntities()
            .map(({ entity }) => entity as Type<AnyEntity>)
            .filter((entity) => Reflect.hasOwnMetadata(ACTION_LOGS_METADATA_KEY, entity.prototype));

        for (const entity of this.loggedEntities) {
            if (!Reflect.getMetadata(REQUIRED_PERMISSION_METADATA_KEY, entity)) {
                throw new Error(
                    `${entity.name} is decorated with @ActionLogs() but is missing a @RequiredPermission decorator. The actionLogs query decides access from the entity's permission.`,
                );
            }
        }
    }

    getLoggedEntities(): ReadonlyArray<Type<AnyEntity>> {
        return this.loggedEntities;
    }

    async getScopeFromEntity<T extends AnyEntity>(entity: T): Promise<ContentScope[] | undefined> {
        if ("scope" in entity) {
            return Array.isArray(entity.scope) ? entity.scope : [entity.scope];
        }
        if (Reflect.hasOwnMetadata(SCOPED_ENTITY_METADATA_KEY, entity.constructor.prototype)) {
            const scoped: ScopedEntityMeta = Reflect.getMetadata(SCOPED_ENTITY_METADATA_KEY, entity.constructor.prototype);
            const scopedEntityScope = await getScopesForScopedEntity({
                scoped,
                entity: entity.constructor as EntityName<AnyEntity>,
                row: entity,
                entityManager: this.entityManager,
                moduleRef: this.moduleRef,
            });
            return Array.isArray(scopedEntityScope) ? scopedEntityScope : [scopedEntityScope];
        }
        return undefined;
    }
}
