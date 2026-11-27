import { createMock } from "@golevelup/ts-vitest";
import { Logger, type Type } from "@nestjs/common";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DiscoverService } from "../dependencies/discover.service.js";
import { DisablePermissionCheck, RequiredPermission } from "../user-permissions/decorators/required-permission.decorator.js";
import { ScopedEntity } from "../user-permissions/decorators/scoped-entity.decorator.js";
import type { Permission } from "../user-permissions/user-permissions.types.js";
import { ActionLogs } from "./action-logs.decorator.js";
import { ActionLogsService } from "./action-logs.service.js";

@ActionLogs()
@RequiredPermission("news" as Permission)
@ScopedEntity(() => ({ domain: "main", language: "en" }))
class ScopedByCallback {}

@ScopedEntity(() => undefined as never)
class ScopedByCallbackReturningNothing {}

@ScopedEntity(() => [])
class ScopedByCallbackReturningEmptyList {}

@ScopedEntity(() => [undefined, { domain: "main", language: "en" }] as never)
class ScopedByCallbackReturningListWithEmptyEntry {}

@ScopedEntity(() => ({ domain: undefined, language: null }) as never)
class ScopedByCallbackReturningEmptyDimensions {}

@ScopedEntity(() => ({}) as never)
class ScopedByCallbackReturningScopeWithoutDimensions {}

@ScopedEntity(() => {
    throw new Error("scope lookup failed");
})
class ScopedByThrowingCallback {}

@ScopedEntity(async () => {
    throw new Error("async scope lookup failed");
})
class ScopedByRejectingCallback {}

@ActionLogs()
@RequiredPermission("news" as Permission)
class WithoutScope {}

@ActionLogs()
@RequiredPermission("news" as Permission)
class WithScopeProperty {
    scope = { domain: "main", language: "de" };
}

@ActionLogs()
@RequiredPermission("products" as Permission, { skipScopeCheck: true })
class SkipsScopeCheck {}

@ActionLogs()
@RequiredPermission(DisablePermissionCheck)
class DisablesPermissionCheck {}

@ActionLogs()
class WithoutPermission {}

const createService = (discoverService: DiscoverService = createMock<DiscoverService>()) =>
    new ActionLogsService(createMock(), createMock(), discoverService);

describe("ActionLogsService.onModuleInit", () => {
    const initWith = (entity: Type<unknown>, { hasScopeProperty = false }: { hasScopeProperty?: boolean } = {}) =>
        createService({
            discoverTargetEntities: () => [{ entity, metadata: { properties: hasScopeProperty ? { scope: {} } : {} } }],
        } as unknown as DiscoverService).onModuleInit();

    it("accepts an entity with a scope property", () => {
        expect(() => initWith(WithScopeProperty, { hasScopeProperty: true })).not.toThrow();
    });

    it("accepts an entity with @ScopedEntity", () => {
        expect(() => initWith(ScopedByCallback)).not.toThrow();
    });

    it("accepts an entity without a scope when its permission skips the scope check", () => {
        expect(() => initWith(SkipsScopeCheck)).not.toThrow();
    });

    it("accepts an entity without a scope when it disables the permission check", () => {
        expect(() => initWith(DisablesPermissionCheck)).not.toThrow();
    });

    it("rejects an entity without a scope whose permission checks the scope", () => {
        expect(() => initWith(WithoutScope)).toThrow(/WithoutScope.*has no scope.*skipScopeCheck/);
    });

    it("rejects an entity without @RequiredPermission", () => {
        expect(() => initWith(WithoutPermission)).toThrow(/missing a @RequiredPermission/);
    });
});

describe("ActionLogsService.getScopeFromEntity", () => {
    const service = createService();

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("reads the scope from the scope property", async () => {
        await expect(service.getScopeFromEntity(new WithScopeProperty())).resolves.toEqual([{ domain: "main", language: "de" }]);
    });

    it("reads the scope from the @ScopedEntity of the entity class", async () => {
        await expect(service.getScopeFromEntity(new ScopedByCallback())).resolves.toEqual([{ domain: "main", language: "en" }]);
    });

    it("returns undefined for an entity without a scope", async () => {
        await expect(service.getScopeFromEntity(new WithoutScope())).resolves.toBeUndefined();
    });

    it("returns undefined when the scope property is empty", async () => {
        await expect(service.getScopeFromEntity(Object.assign(new WithScopeProperty(), { scope: undefined }))).resolves.toBeUndefined();
        await expect(service.getScopeFromEntity(Object.assign(new WithScopeProperty(), { scope: null }))).resolves.toBeUndefined();
    });

    it("returns undefined when @ScopedEntity resolves to nothing", async () => {
        await expect(service.getScopeFromEntity(new ScopedByCallbackReturningNothing())).resolves.toBeUndefined();
        await expect(service.getScopeFromEntity(new ScopedByCallbackReturningEmptyList())).resolves.toBeUndefined();
    });

    it("returns undefined when every dimension of the resolved scope is empty", async () => {
        await expect(service.getScopeFromEntity(new ScopedByCallbackReturningEmptyDimensions())).resolves.toBeUndefined();
    });

    it("keeps a scope without dimensions", async () => {
        await expect(service.getScopeFromEntity(new ScopedByCallbackReturningScopeWithoutDimensions())).resolves.toEqual([{}]);
    });

    it("returns undefined and logs the error when the scope lookup throws", async () => {
        const logError = vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);

        await expect(service.getScopeFromEntity(new ScopedByThrowingCallback())).resolves.toBeUndefined();
        await expect(service.getScopeFromEntity(new ScopedByRejectingCallback())).resolves.toBeUndefined();

        expect(logError).toHaveBeenCalledTimes(2);
        expect(logError).toHaveBeenCalledWith(expect.stringContaining("ScopedByThrowingCallback"), expect.any(String));
        expect(logError).toHaveBeenCalledWith(expect.stringContaining("async scope lookup failed"), expect.any(String));
    });

    it("drops empty entries from the resolved scopes", async () => {
        await expect(service.getScopeFromEntity(new ScopedByCallbackReturningListWithEmptyEntry())).resolves.toEqual([
            { domain: "main", language: "en" },
        ]);
    });
});
