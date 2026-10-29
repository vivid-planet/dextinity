import { createMock } from "@golevelup/ts-vitest";
import type { EntityManager } from "@mikro-orm/postgresql";
import { describe, expect, it } from "vitest";

import type { ContentScope } from "./interfaces/content-scope.interface.js";
import type { User } from "./interfaces/user.js";
import { UserContentScopesResolver } from "./user-content-scopes.resolver.js";
import type { UserPermissionsService } from "./user-permissions.service.js";

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
            const resolver = new UserContentScopesResolver(userService, createMock<EntityManager>());

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
            const resolver = new UserContentScopesResolver(userService, createMock<EntityManager>());

            expect(await resolver.userPermissionsAvailableContentScopeDimensions()).toEqual(dimensions);
        });
    });
});
