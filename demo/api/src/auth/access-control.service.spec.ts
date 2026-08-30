import { type User, UserPermissions } from "@comet/cms-api";
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

        it("should return a deterministic subset of content scopes for non-admin user", () => {
            const nonAdminUser = staticUsers[1]; // id "2"

            const contentScopes = service.getContentScopesForUser(nonAdminUser);

            // 2 domains × 2 languages × 3 countries, all mapped to the organization derived from the user id.
            expect(contentScopes).toHaveLength(12);
            expect(contentScopes).toContainEqual({ domain: "main", language: "en", organization: "organization-2", country: "country-1" });
            expect(Array.isArray(contentScopes) && contentScopes.every((scope) => scope.organization === "organization-2")).toBe(true);
        });

        it("should fall back to the first organization for a user with a non-numeric id", () => {
            const unknownUser: User = {
                id: "b26d86a7-32bb-4c84-ab9d-d167dddd40ff",
                name: "Unknown User",
                email: "unknown@example.com",
                isAdmin: false,
            };

            const contentScopes = service.getContentScopesForUser(unknownUser);

            expect(contentScopes).toHaveLength(12);
            expect(Array.isArray(contentScopes) && contentScopes.every((scope) => scope.organization === "organization-1")).toBe(true);
        });
    });
});
