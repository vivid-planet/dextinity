import type { EntityData } from "@mikro-orm/core";
import { EntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Injectable, Scope } from "@nestjs/common";
import DataLoader from "dataloader";

import { ActionLog } from "./entities/action-log.entity.js";

type Key = Pick<ActionLog, "entityName" | "entityId" | "version">;

type PreviousActionLogRow = EntityData<ActionLog> & { keyIndex: number };

@Injectable({ scope: Scope.REQUEST })
export class PreviousActionLogLoaderService {
    private dataLoader: DataLoader<Key, ActionLog | null, string>;

    constructor(private readonly entityManager: EntityManager<PostgreSqlDriver>) {
        this.dataLoader = new DataLoader<Key, ActionLog | null, string>(
            async (keys) => {
                const rows: PreviousActionLogRow[] = await this.entityManager.getConnection().execute(
                    `SELECT "key"."index" AS "keyIndex", "previous".*
                    FROM (VALUES ${keys.map(() => "(?::int, ?::text, ?::uuid, ?::int)").join(", ")}) AS "key"("index", "entityName", "entityId", "version")
                    CROSS JOIN LATERAL (
                        SELECT * FROM "ActionLog"
                        WHERE "ActionLog"."entityName" = "key"."entityName"
                            AND "ActionLog"."entityId" = "key"."entityId"
                            AND "ActionLog"."version" < "key"."version"
                        ORDER BY "ActionLog"."version" DESC
                        LIMIT 1
                    ) AS "previous"`,
                    keys.flatMap((key, index) => [index, key.entityName, key.entityId, key.version]),
                );
                const previousByKeyIndex = new Map(rows.map(({ keyIndex, ...row }) => [keyIndex, this.entityManager.map(ActionLog, row)]));
                return keys.map((key, index) => previousByKeyIndex.get(index) ?? null);
            },
            { cacheKeyFn: (key) => `${key.entityName}/${key.entityId}/${key.version}` },
        );
    }

    load(actionLog: Key): Promise<ActionLog | null> {
        return this.dataLoader.load(actionLog);
    }
}
