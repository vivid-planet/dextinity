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
                    // Access to a row is checked against one of its own scopes. A previous version that lacks one of the
                    // current row's scopes could hold content the user may not read, so it is not returned.
                    return previous && containsAllScopes(previous.scope, key.scope) ? previous : null;
                });
            },
            { cacheKeyFn: (key) => `${key.entityName}/${key.entityId}/${key.version}` },
        );
    }

    load(actionLog: Key): Promise<ActionLog | null> {
        return this.dataLoader.load(actionLog);
    }
}

function containsAllScopes(scopes: ContentScope[] | undefined | null, requiredScopes: ContentScope[] | undefined | null): boolean {
    if (!scopes || !requiredScopes) {
        return !scopes && !requiredScopes;
    }
    return requiredScopes.every((requiredScope) => scopes.some((scope) => isDeepStrictEqual(scope, requiredScope)));
}
