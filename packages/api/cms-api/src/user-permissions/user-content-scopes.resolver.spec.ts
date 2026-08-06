import { createMock } from "@golevelup/ts-vitest";
import type { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { describe, expect, it } from "vitest";

import type { UserContentScopes } from "./entities/user-content-scopes.entity";
import type { ContentScope } from "./interfaces/content-scope.interface";
import type { User } from "./interfaces/user";
import { UserContentScopesResolver } from "./user-content-scopes.resolver";
import type { UserPermissionsService } from "./user-permissions.service";

describe("UserContentScopesResolver", () => {
    describe("userPermissionsContentScopes", () => {
        it("returns the content scopes of the user", async () => {
            const contentScopes: ContentScope[] = [
                { domain: "main", language: "en" },
                { domain: "main", language: "*", product: "*" },
            ];
            const userService = createMock<UserPermissionsService>({
                findUserOrThrow: async () => ({ id: "1", name: "User", email: "user@example.com" }) satisfies User,
                filterContentScopesForUser: async () => contentScopes,
            });
            const resolver = new UserContentScopesResolver(
                createMock<EntityRepository<UserContentScopes>>(),
                userService,
                createMock<EntityManager>(),
            );

            expect(await resolver.userPermissionsContentScopes("1")).toEqual(contentScopes);
        });
    });

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
