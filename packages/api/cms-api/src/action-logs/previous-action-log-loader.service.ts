import { EntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Injectable, Scope } from "@nestjs/common";
import DataLoader from "dataloader";

import { ActionLog } from "./entities/action-log.entity";

type Key = Pick<ActionLog, "entityName" | "entityId" | "version">;

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
                return keys.map(
                    (key) =>
                        candidates.find(
                            (candidate) =>
                                candidate.entityName === key.entityName && candidate.entityId === key.entityId && candidate.version < key.version,
                        ) ?? null,
                );
            },
            { cacheKeyFn: (key) => `${key.entityName}/${key.entityId}/${key.version}` },
        );
    }

    load(actionLog: Key): Promise<ActionLog | null> {
        return this.dataLoader.load(actionLog);
    }
}
