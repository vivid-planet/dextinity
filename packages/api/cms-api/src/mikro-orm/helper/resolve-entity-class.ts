import { type EntityClass, MetadataStorage } from "@mikro-orm/postgresql";

/**
 * Resolves an entity class by its class name.
 *
 * MikroORM v7 dropped support for referencing entities by name, so relations, repositories and queries must
 * point at the entity class. Dextinity lets applications provide concrete entities for its abstract base
 * entities, which means the class isn't available where the library code is defined. Looking the class up in
 * MikroORM's metadata bridges that gap: every entity class registers itself there when it is decorated.
 */
export function resolveEntityClass<T extends object>(className: string): EntityClass<T> {
    const candidates = Object.values(MetadataStorage.getMetadata()).filter((meta) => meta.className === className && meta.class);
    const entityClass = candidates[candidates.length - 1]?.class as EntityClass<T> | undefined;

    if (!entityClass) {
        throw new Error(
            `Cannot resolve the entity class for "${className}". Make sure the module defining the entity is imported before MikroORM discovers entities.`,
        );
    }

    return entityClass;
}
