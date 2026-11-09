import { createMock } from "@golevelup/ts-vitest";
import { describe, expect, it } from "vitest";

import { DiscoverService } from "../dependencies/discover.service";
import { ScopedEntity } from "../user-permissions/decorators/scoped-entity.decorator";
import { ActionLogsService } from "./action-logs.service";

@ScopedEntity(() => ({ domain: "main", language: "en" }))
class ScopedByCallback {}

class WithoutScope {}

class WithScopeProperty {
    scope = { domain: "main", language: "de" };
}

const createService = () => new ActionLogsService(createMock(), createMock(), createMock<DiscoverService>());

describe("ActionLogsService.getScopeFromEntity", () => {
    const service = createService();

    it("reads the scope from the scope property", async () => {
        await expect(service.getScopeFromEntity(new WithScopeProperty())).resolves.toEqual([{ domain: "main", language: "de" }]);
    });

    it("reads the scope from the @ScopedEntity of the entity class", async () => {
        await expect(service.getScopeFromEntity(new ScopedByCallback())).resolves.toEqual([{ domain: "main", language: "en" }]);
    });

    it("returns undefined for an entity without a scope", async () => {
        await expect(service.getScopeFromEntity(new WithoutScope())).resolves.toBeUndefined();
    });
});
