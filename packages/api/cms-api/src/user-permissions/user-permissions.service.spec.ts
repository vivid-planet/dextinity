import type { DiscoveryService } from "@golevelup/nestjs-discovery";
import type { EntityRepository } from "@mikro-orm/postgresql";
import { describe, expect, it, vi } from "vitest";

import type { UserContentScopes } from "./entities/user-content-scopes.entity";
import type { UserPermission } from "./entities/user-permission.entity";
import type { ContentScope } from "./interfaces/content-scope.interface";
import type { User } from "./interfaces/user";
import { UserPermissionsService } from "./user-permissions.service";
import { type AccessControlServiceInterface, UserPermissions, type UserPermissionsOptions } from "./user-permissions.types";

function createService({
    availableContentScopes,
    getContentScopesForUser,
}: {
    availableContentScopes: ContentScope[];
    getContentScopesForUser?: AccessControlServiceInterface["getContentScopesForUser"];
}) {
    const options: UserPermissionsOptions = { availableContentScopes };
    const accessControlService: AccessControlServiceInterface = { isAllowed: () => true, getContentScopesForUser };
    const contentScopeRepository = { findOne: vi.fn().mockResolvedValue(null) } as unknown as EntityRepository<UserContentScopes>;
    const permissionRepository = {} as EntityRepository<UserPermission>;

    return new UserPermissionsService(options, undefined, accessControlService, permissionRepository, contentScopeRepository, {} as DiscoveryService);
}

describe("UserPermissionsService", () => {
    const scopeA: ContentScope = { domain: "main", language: "en" };
    const scopeB: ContentScope = { domain: "secondary", language: "de" };

    const userA: User = { id: "a", name: "User A", email: "a@example.com" };
    const userB: User = { id: "b", name: "User B", email: "b@example.com" };

    describe("getContentScopesForUsers", () => {
        it("computes the available content scopes only once for all users", async () => {
            const service = createService({
                availableContentScopes: [scopeA, scopeB],
                getContentScopesForUser: () => UserPermissions.allContentScopes,
            });
            const getAvailableContentScopes = vi.spyOn(service, "getAvailableContentScopes");

            const result = await service.getContentScopesForUsers([userA, userB]);

            expect(getAvailableContentScopes).toHaveBeenCalledTimes(1);
            expect(result).toEqual([
                [scopeA, scopeB],
                [scopeA, scopeB],
            ]);
        });

        it("returns each user's content scopes in the order of the passed users", async () => {
            const service = createService({
                availableContentScopes: [scopeA, scopeB],
                getContentScopesForUser: (user) => (user.id === "a" ? [scopeA] : [scopeB]),
            });

            await expect(service.getContentScopesForUsers([userA, userB])).resolves.toEqual([[scopeA], [scopeB]]);
        });
    });
});
