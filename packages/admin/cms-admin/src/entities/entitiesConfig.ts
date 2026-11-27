import { useDextinityConfig } from "../config/DextinityConfigContext";
import type { EntityInterface } from "./types";

/**
 * The key is the entity name as the API uses it: the name of the GraphQL object type, which is also the `entityName` of `@EntityInfo`, e.g. `News`, `PageTreeNode` or `DamFile`.
 * Features look up entities by this name, so an entry with a different key is never found.
 */
export type EntitiesConfig = Record<string, EntityInterface>;

export function useEntitiesConfig(): EntitiesConfig {
    return useDextinityConfig().entities ?? {};
}

/**
 * Returns the entry registered for `entityName` in the `entities` config, or `undefined` if the project hasn't registered this entity type.
 */
export function useEntity(entityName: string): EntityInterface | undefined {
    return useEntitiesConfig()[entityName];
}
