import type { AnyEntity } from "@mikro-orm/postgresql";
import { type CustomDecorator, SetMetadata, type Type } from "@nestjs/common";

import type { ContentScope } from "../../user-permissions/interfaces/content-scope.interface.js";

type EntityScopeFunction<Entity extends AnyEntity = AnyEntity> = (
    item: Entity,
) => ContentScope | ContentScope[] | Promise<ContentScope | ContentScope[]>;
export interface EntityScopeServiceInterface<Entity extends AnyEntity = AnyEntity> {
    getEntityScope: EntityScopeFunction<Entity>;
}

/**
 * A single declarative scope mapping:
 * - A string is a field path pointing to the scope object, e.g. `"company.scope"`.
 * - An object maps scope properties to field paths, e.g. `{ companyId: "company.id" }`.
 */
export type SingleEntityScopeMapping = string | Record<string, string>;

/**
 * Declarative, SQL-convertible description of an entity's scope(s).
 *
 * In contrast to the callback and service variants, this can be both resolved to a SQL expression (required by the
 * `FullTextSearchModule`, which builds the scope from the database) and evaluated at runtime (e.g. in the auth guard).
 *
 * A single mapping (the common case) describes one scope. An array of mappings describes multiple scopes, e.g.
 * `["company.scope", "otherCompany.scope"]`.
 */
export type EntityScopeMapping = SingleEntityScopeMapping | SingleEntityScopeMapping[];

export type ScopedEntityMeta<Entity extends AnyEntity = AnyEntity> =
    | EntityScopeFunction<Entity>
    | Type<EntityScopeServiceInterface<Entity>>
    | EntityScopeMapping;

export const SCOPED_ENTITY_METADATA_KEY = "scopedEntity";

export function ScopedEntity<Entity extends AnyEntity = AnyEntity>(value: ScopedEntityMeta<Entity>): CustomDecorator<string> {
    return SetMetadata<string, ScopedEntityMeta<Entity>>(SCOPED_ENTITY_METADATA_KEY, value);
}

export function isEntityScopeMapping(value: ScopedEntityMeta): value is EntityScopeMapping {
    if (Array.isArray(value)) {
        return value.every(isSingleEntityScopeMapping);
    }
    return isSingleEntityScopeMapping(value);
}

function isSingleEntityScopeMapping(value: unknown): value is SingleEntityScopeMapping {
    if (typeof value === "string") {
        return true;
    }
    // object mapping scope keys to field paths, e.g. { companyId: "company.id" }
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        Object.values(value).every((fieldPath) => typeof fieldPath === "string")
    );
}
