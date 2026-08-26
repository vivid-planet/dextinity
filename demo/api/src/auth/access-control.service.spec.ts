import { type User, UserPermissions } from "@dextinity/cms-api";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it } from "vitest";

import { AccessControlService } from "./access-control.service";
import { staticUsers } from "./static-users";

describe("AccessControlService", () => {
    let service: AccessControlService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AccessControlService],
        }).compile();

        service = module.get<AccessControlService>(AccessControlService);
    });

    describe("getPermissionsForUser", () => {
        it("should return all permissions for admin user", () => {
            const adminUser = staticUsers[0];

            const permissions = service.getPermissionsForUser(adminUser, ["news", "products", "userPermissions"]);

            expect(permissions).toEqual(UserPermissions.allPermissions);
        });

        it("should return filtered permissions for non-admin user", () => {
            const nonAdminUser = staticUsers[1];

            const permissions = service.getPermissionsForUser(nonAdminUser, ["news", "products", "userPermissions"]);

            expect(permissions).toEqual([{ permission: "news" }, { permission: "products" }]);
        });

        it("should filter out userPermissions for non-admin user", () => {
            const unknownUser: User = {
                id: "b26d86a7-32bb-4c84-ab9d-d167dddd40ff",
                name: "Unknown User",
                email: "unknown@example.com",
                isAdmin: false,
            };

            const permissions = service.getPermissionsForUser(unknownUser, ["news", "userPermissions"]);

            expect(permissions).toEqual([{ permission: "news" }]);
        });
    });

    describe("getContentScopesForUser", () => {
        it("should return all content scopes for admin user", () => {
            const adminUser = staticUsers[0];

            const contentScopes = service.getContentScopesForUser(adminUser);

            expect(contentScopes).toEqual(UserPermissions.allContentScopes);
        });

        it("should return limited content scopes for non-admin user", () => {
            const nonAdminUser = staticUsers[1];

            const contentScopes = service.getContentScopesForUser(nonAdminUser);

            expect(contentScopes).toEqual([{ domain: "main", language: "en" }]);
        });

        it("should return limited content scopes for unknown non-admin user", () => {
            const unknownUser: User = {
                id: "b26d86a7-32bb-4c84-ab9d-d167dddd40ff",
                name: "Unknown User",
                email: "unknown@example.com",
                isAdmin: false,
            };

            const contentScopes = service.getContentScopesForUser(unknownUser);

            expect(contentScopes).toEqual([{ domain: "main", language: "en" }]);
        });
    });
});
