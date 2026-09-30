import { createMock } from "@golevelup/ts-vitest";
import type { EntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { describe, expect, it } from "vitest";

import type { ActionLog } from "./entities/action-log.entity";
import { PreviousActionLogLoaderService } from "./previous-action-log-loader.service";

const actionLog = (version: number, scope: ActionLog["scope"]): ActionLog => ({ entityName: "News", entityId: "1", version, scope }) as ActionLog;

const createLoader = (candidates: ActionLog[]): PreviousActionLogLoaderService =>
    new PreviousActionLogLoaderService(createMock<EntityManager<PostgreSqlDriver>>({ find: async () => candidates as never }));

describe("PreviousActionLogLoaderService", () => {
    it("returns the most recent earlier version in the same scopes", async () => {
        const previous = actionLog(2, [{ domain: "main", language: "en" }]);
        const loader = createLoader([previous, actionLog(1, [{ domain: "main", language: "en" }])]);

        await expect(loader.load(actionLog(3, [{ domain: "main", language: "en" }]))).resolves.toBe(previous);
    });

    it("returns null when the most recent earlier version belongs to other scopes", async () => {
        const loader = createLoader([actionLog(2, [{ domain: "secondary", language: "en" }]), actionLog(1, [{ domain: "main", language: "en" }])]);

        await expect(loader.load(actionLog(3, [{ domain: "main", language: "en" }]))).resolves.toBeNull();
    });

    it("returns the earlier version when it held more scopes than the current one", async () => {
        const previous = actionLog(1, [{ domain: "main" }, { domain: "secondary" }]);
        const loader = createLoader([previous]);

        await expect(loader.load(actionLog(2, [{ domain: "main" }]))).resolves.toBe(previous);
    });

    it("returns null when the earlier version lacks one of the current scopes", async () => {
        const loader = createLoader([actionLog(1, [{ domain: "main" }])]);

        await expect(loader.load(actionLog(2, [{ domain: "main" }, { domain: "secondary" }]))).resolves.toBeNull();
    });

    it("returns null when an unscoped entity's earlier version had a scope", async () => {
        const loader = createLoader([actionLog(1, [{ domain: "main" }])]);

        await expect(loader.load(actionLog(2, undefined))).resolves.toBeNull();
    });

    it("compares the scopes regardless of their order", async () => {
        const previous = actionLog(1, [{ domain: "secondary" }, { domain: "main" }]);
        const loader = createLoader([previous]);

        await expect(loader.load(actionLog(2, [{ domain: "main" }, { domain: "secondary" }]))).resolves.toBe(previous);
    });

    it("returns the earlier version of an unscoped entity", async () => {
        const previous = actionLog(1, undefined);
        const loader = createLoader([previous]);

        await expect(loader.load(actionLog(2, undefined))).resolves.toBe(previous);
    });
});
