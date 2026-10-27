import { AnyEntity, EntityManager, FilterQuery } from "@mikro-orm/postgresql";
import { ModuleRef } from "@nestjs/core";
import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { GraphQLJSONObject } from "graphql-scalars";

import { RequiredPermission } from "../user-permissions/decorators/required-permission.decorator";
import { SCOPED_ENTITY_METADATA_KEY, ScopedEntityMeta } from "../user-permissions/decorators/scoped-entity.decorator";
import { getScopesForScopedEntity } from "../user-permissions/get-scopes-for-scoped-entity";
import { ContentScope } from "../user-permissions/interfaces/content-scope.interface";
import { Dependency } from "./dto/dependency";

@Resolver(() => Dependency)
@RequiredPermission("dependencies")
export class DependencyResolver {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly moduleRef: ModuleRef,
    ) {}

    @ResolveField(() => GraphQLJSONObject, {
        nullable: true,
        description:
            "Scope of the root entity for dependents, of the target entity for dependencies. Entities with multiple scopes return their first.",
    })
    async scope(@Parent() dependency: Dependency): Promise<ContentScope | null> {
        const { entityName, id } =
            dependency.context === "dependents"
                ? { entityName: dependency.rootEntityName, id: dependency.rootId }
                : { entityName: dependency.targetEntityName, id: dependency.targetId };

        const metadata = this.entityManager.getMetadata().find(entityName);
        if (!metadata) {
            return null;
        }

        // The block index is refreshed periodically, so it may still reference an entity that has been deleted since.
        const row: AnyEntity | null = await this.entityManager.findOne(metadata.class, { [metadata.primaryKeys[0]]: id } as FilterQuery<AnyEntity>, {
            filters: false,
        });
        if (!row) {
            return null;
        }

        if (row.scope) {
            return row.scope as ContentScope;
        }

        const scoped = Reflect.getMetadata(SCOPED_ENTITY_METADATA_KEY, metadata.class) as ScopedEntityMeta | undefined;
        if (!scoped) {
            return null;
        }

        const scopes = await getScopesForScopedEntity({
            scoped,
            entity: entityName,
            row,
            entityManager: this.entityManager,
            moduleRef: this.moduleRef,
        });

        return (Array.isArray(scopes) ? scopes[0] : scopes) ?? null;
    }
}
