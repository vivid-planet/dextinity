import { type EntityClass, MetadataStorage } from "@mikro-orm/postgresql";

/**
 * Resolves an entity class by its class name.
 *
 * MikroORM v7 dropped name-based entity references, but applications provide the concrete entities for
 * Dextinity's abstract base entities, so the class isn't available where the library code is defined.
 * Every entity registers itself in MikroORM's metadata when it is decorated, which bridges that gap.
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
