import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable, Scope } from "@nestjs/common";
import DataLoader from "dataloader";

import { EntityInfoObject } from "../entity-info/entity-info.object";
import { ContentScope } from "../user-permissions/interfaces/content-scope.interface";

type EntityInfoKey = { entityName: string; id: string };

function keyToString({ entityName, id }: EntityInfoKey): string {
    return `${entityName}$${id}`;
}

/**
 * Loads the scopes of entities from the EntityInfo view, batched per request.
 *
 * Without batching, resolving the scope of every entry of a dependency list would issue one query per entry.
 */
@Injectable({ scope: Scope.REQUEST })
export class DependencyScopeLoaderService {
    private readonly dataLoader: DataLoader<EntityInfoKey, ContentScope[] | undefined, string>;

    constructor(private readonly entityManager: EntityManager) {
        this.dataLoader = new DataLoader<EntityInfoKey, ContentScope[] | undefined, string>(
            async (keys) => {
                const entityInfos = await this.entityManager.find(
                    EntityInfoObject,
                    { $or: keys.map(({ entityName, id }) => ({ entityName, id })) },
                    { fields: ["id", "entityName", "scopes"] },
                );

                const scopesByKey = new Map(entityInfos.map((entityInfo) => [keyToString(entityInfo), entityInfo.scopes]));

                return keys.map((key) => scopesByKey.get(keyToString(key)));
            },
            { cacheKeyFn: keyToString },
        );
    }

    async load(key: EntityInfoKey): Promise<ContentScope | undefined> {
        const scopes = await this.dataLoader.load(key);

        // Entities with multiple scopes report their first scope, matching what a list can link to.
        return scopes?.[0];
    }
}
