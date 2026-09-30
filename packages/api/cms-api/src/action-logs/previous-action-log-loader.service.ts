import { isDeepStrictEqual } from "node:util";

import { EntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Injectable, Scope } from "@nestjs/common";
import DataLoader from "dataloader";

import type { ContentScope } from "../user-permissions/interfaces/content-scope.interface";
import { ActionLog } from "./entities/action-log.entity";

type Key = Pick<ActionLog, "entityName" | "entityId" | "version" | "scope">;

@Injectable({ scope: Scope.REQUEST })
export class PreviousActionLogLoaderService {
    private dataLoader: DataLoader<Key, ActionLog | null, string>;

    constructor(private readonly entityManager: EntityManager<PostgreSqlDriver>) {
        this.dataLoader = new DataLoader<Key, ActionLog | null, string>(
            async (keys) => {
                const candidates = await this.entityManager.find(
                    ActionLog,
                    {
                        $or: keys.map((key) => ({
                            entityName: key.entityName,
                            entityId: key.entityId,
                            version: { $lt: key.version },
                        })),
                    },
                    { orderBy: { version: "DESC" } },
                );
                return keys.map((key) => {
                    const previous = candidates.find(
                        (candidate) =>
                            candidate.entityName === key.entityName && candidate.entityId === key.entityId && candidate.version < key.version,
                    );
                    // Access to a row is checked against its own scopes. A previous version in other scopes could hold
                    // content the user may not read, so it is not returned.
                    return previous && scopesAreEqual(previous.scope, key.scope) ? previous : null;
                });
            },
            { cacheKeyFn: (key) => `${key.entityName}/${key.entityId}/${key.version}` },
        );
    }

    load(actionLog: Key): Promise<ActionLog | null> {
        return this.dataLoader.load(actionLog);
    }
}

function scopesAreEqual(scopes: ContentScope[] | undefined | null, otherScopes: ContentScope[] | undefined | null): boolean {
    if (!scopes || !otherScopes) {
        return !scopes && !otherScopes;
    }
    return scopes.length === otherScopes.length && scopes.every((scope) => otherScopes.some((otherScope) => isDeepStrictEqual(scope, otherScope)));
}
