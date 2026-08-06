import { createMock } from "@golevelup/ts-vitest";
import type { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { describe, expect, it } from "vitest";

import type { UserContentScopes } from "./entities/user-content-scopes.entity";
import { UserContentScopesResolver } from "./user-content-scopes.resolver";
import type { UserPermissionsService } from "./user-permissions.service";

describe("UserContentScopesResolver", () => {
    describe("userPermissionsAvailableContentScopeDimensions", () => {
        it("returns the dimensions from the service", async () => {
            const dimensions = [
                { name: "domain", label: "Domain" },
                { name: "language", label: "Language" },
                { name: "product", label: "Product" },
            ];
            const userService = createMock<UserPermissionsService>({
                getAvailableContentScopeDimensions: async () => dimensions,
            });
            const resolver = new UserContentScopesResolver(
                createMock<EntityRepository<UserContentScopes>>(),
                userService,
                createMock<EntityManager>(),
            );

            expect(await resolver.userPermissionsAvailableContentScopeDimensions()).toEqual(dimensions);
        });
    });
});
