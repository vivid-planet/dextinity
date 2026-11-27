import type { EntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { describe, expect, it, vi } from "vitest";

import { PreviousActionLogLoaderService } from "./previous-action-log-loader.service.js";

const newsId = "4f7d2c1e-5a8b-4c3d-9e6f-1a2b3c4d5e6f";
const productId = "8a9b0c1d-2e3f-4a5b-8c7d-9e0f1a2b3c4d";

function createLoader(rows: Array<Record<string, unknown>>) {
    const execute = vi.fn().mockResolvedValue(rows);
    const map = vi.fn((_entity: unknown, row: Record<string, unknown>) => ({ mapped: row }));
    const entityManager = { getConnection: () => ({ execute }), map } as unknown as EntityManager<PostgreSqlDriver>;
    return { loader: new PreviousActionLogLoaderService(entityManager), execute, map };
}

describe("PreviousActionLogLoaderService", () => {
    it("assigns each returned row to its own key and returns null for keys without an earlier entry", async () => {
        const { loader, execute, map } = createLoader([
            { keyIndex: 1, id: "product-v1", entityName: "Product", entityId: productId, version: 1 },
            { keyIndex: 0, id: "news-v2", entityName: "News", entityId: newsId, version: 2 },
        ]);

        await expect(
            Promise.all([
                loader.load({ entityName: "News", entityId: newsId, version: 5 }),
                loader.load({ entityName: "Product", entityId: productId, version: 2 }),
                loader.load({ entityName: "News", entityId: newsId, version: 1 }),
            ]),
        ).resolves.toEqual([
            { mapped: { id: "news-v2", entityName: "News", entityId: newsId, version: 2 } },
            { mapped: { id: "product-v1", entityName: "Product", entityId: productId, version: 1 } },
            null,
        ]);

        expect(execute).toHaveBeenCalledTimes(1);
        expect(execute.mock.calls[0][1]).toEqual([0, "News", newsId, 5, 1, "Product", productId, 2, 2, "News", newsId, 1]);
        expect(map).toHaveBeenCalledTimes(2);
    });

    it("queries a key only once per request", async () => {
        const { loader, execute } = createLoader([{ keyIndex: 0, id: "news-v1", entityName: "News", entityId: newsId, version: 1 }]);

        const key = { entityName: "News", entityId: newsId, version: 2 };
        await Promise.all([loader.load(key), loader.load({ ...key })]);
        await loader.load({ ...key });

        expect(execute).toHaveBeenCalledTimes(1);
        expect(execute.mock.calls[0][1]).toEqual([0, "News", newsId, 2]);
    });
});
