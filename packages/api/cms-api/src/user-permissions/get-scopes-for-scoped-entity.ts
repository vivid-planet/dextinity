import { type AnyEntity, type EntityManager, type EntityName, Reference, wrap } from "@mikro-orm/postgresql";
import type { ModuleRef } from "@nestjs/core";

import { isInjectableService } from "../common/helper/is-injectable-service.helper";
import {
    type EntityScopeMapping,
    isEntityScopeMapping,
    type ScopedEntityMeta,
    type SingleEntityScopeMapping,
} from "./decorators/scoped-entity.decorator";
import type { ContentScope } from "./interfaces/content-scope.interface";

/**
 * Resolves the scope of an entity from its `@ScopedEntity` metadata, supporting all variants:
 * the SQL-convertible mapping (string/object), an injectable service or a plain callback.
 */
export async function getScopesForScopedEntity({
    scoped,
    entity,
    row,
    entityManager,
    moduleRef,
}: {
    scoped: ScopedEntityMeta;
    entity: EntityName<AnyEntity>;
    row: AnyEntity;
    entityManager: EntityManager;
    moduleRef: ModuleRef;
}): Promise<ContentScope | ContentScope[]> {
    if (isEntityScopeMapping(scoped)) {
        return resolveScopeMapping({ mapping: scoped, entity, row, entityManager });
    }
    if (isInjectableService(scoped)) {
        const service = moduleRef.get(scoped, { strict: false });
        return service.getEntityScope(row);
    }
    if (typeof scoped === "function") {
        return scoped(row);
    }
    const entityName = typeof entity === "string" ? entity : entity.name;
    throw new Error(`Invalid @ScopedEntity value for entity "${entityName}": expected a callback, a service class, or a scope mapping.`);
}

async function resolveScopeMapping({
    mapping,
    entity,
    row,
    entityManager,
}: {
    mapping: EntityScopeMapping;
    entity: EntityName<AnyEntity>;
    row: AnyEntity;
    entityManager: EntityManager;
}): Promise<ContentScope | ContentScope[]> {
    if (Array.isArray(mapping)) {
        return Promise.all(mapping.map((singleMapping) => resolveSingleScopeMapping({ mapping: singleMapping, entity, row, entityManager })));
    }
    return resolveSingleScopeMapping({ mapping, entity, row, entityManager });
}

async function resolveSingleScopeMapping({
    mapping,
    entity,
    row,
    entityManager,
}: {
    mapping: SingleEntityScopeMapping;
    entity: EntityName<AnyEntity>;
    row: AnyEntity;
    entityManager: EntityManager;
}): Promise<ContentScope> {
    if (typeof mapping === "string") {
        return (await resolvePathValue({ path: mapping, entity, row, entityManager })) as ContentScope;
    }

    const scope: Record<string, unknown> = {};
    for (const [key, path] of Object.entries(mapping)) {
        scope[key] = await resolvePathValue({ path, entity, row, entityManager });
    }
    return scope as ContentScope;
}

async function resolvePathValue({
    path,
    entity,
    row,
    entityManager,
}: {
    path: string;
    entity: EntityName<AnyEntity>;
    row: AnyEntity;
    entityManager: EntityManager;
}): Promise<unknown> {
    const entityName = typeof entity === "string" ? entity : entity.name;
    let metadata = entityManager.getMetadata().get(entityName);
    let current: unknown = row;

    for (const part of path.split(".")) {
        if (current == null) {
            return undefined;
        }
        const prop = metadata.props.find((p) => p.name === part);
        if (!prop) {
            throw new Error(`Field "${part}" not found in entity "${metadata.className}" while resolving @ScopedEntity path "${path}"`);
        }

        const value = (current as Record<string, unknown>)[part];
        if (prop.kind === "m:1" || prop.kind === "1:1") {
            if (!prop.targetMeta) {
                throw new Error(`Relation "${part}" has no target metadata`);
            }
            current = await loadRelation(value);
            metadata = prop.targetMeta;
        } else {
            current = value;
        }
    }

    return current;
}

async function loadRelation(value: unknown): Promise<unknown> {
    if (value == null) {
        return value;
    }
    if (Reference.isReference(value)) {
        return value.load();
    }
    const wrapped = wrap(value as AnyEntity);
    if (!wrapped.isInitialized()) {
        return wrapped.init();
    }
    return value;
}
