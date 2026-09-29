import type { DiscoveryService } from "@golevelup/nestjs-discovery";
import { createMock } from "@golevelup/ts-vitest";
import type { EntityRepository } from "@mikro-orm/postgresql";
import { describe, expect, it, vi } from "vitest";

import type { UserContentScopes } from "./entities/user-content-scopes.entity";
import type { UserPermission } from "./entities/user-permission.entity";
import type { ContentScope } from "./interfaces/content-scope.interface";
import type { User } from "./interfaces/user";
import { UserPermissionsService } from "./user-permissions.service";
import {
    type AccessControlServiceInterface,
    UserPermissions,
    type UserPermissionsOptions,
    type UserPermissionsUserServiceInterface,
} from "./user-permissions.types";

const user: User = { id: "1", name: "User", email: "user@example.com" };

function createService(
    options: UserPermissionsOptions,
    {
        getContentScopesForUser,
        manualContentScopes,
        userService,
    }: {
        getContentScopesForUser?: AccessControlServiceInterface["getContentScopesForUser"];
        manualContentScopes?: ContentScope[];
        userService?: UserPermissionsUserServiceInterface;
    } = {},
): UserPermissionsService {
    return new UserPermissionsService(
        options,
        userService,
        createMock<AccessControlServiceInterface>({ isAllowed: () => true, getContentScopesForUser }),
        createMock<EntityRepository<UserPermission>>(),
        createMock<EntityRepository<UserContentScopes>>({
            findOne: async () => (manualContentScopes ? ({ userId: user.id, contentScopes: manualContentScopes } as UserContentScopes) : null),
        }),
        createMock<DiscoveryService>(),
    );
}

describe("UserPermissionsService", () => {
    describe("getAvailableContentScopeDimensions", () => {
        it("returns the configured dimensions and falls back to the name for missing labels", async () => {
            const service = createService({
                availableContentScopeDimensions: [{ name: "domain", label: "Domain" }, { name: "language" }, { name: "product" }],
            });

            const dimensions = await service.getAvailableContentScopeDimensions();

            expect(dimensions).toEqual([
                { name: "domain", label: "Domain" },
                { name: "language", label: "language" },
                { name: "product", label: "product" },
            ]);
        });

        it("resolves a factory function", async () => {
            const service = createService({
                availableContentScopeDimensions: () => [{ name: "domain" }],
            });

            const dimensions = await service.getAvailableContentScopeDimensions();

            expect(dimensions).toEqual([{ name: "domain", label: "domain" }]);
        });

        it("derives the dimensions from the available content scopes when not configured", async () => {
            const service = createService({
                availableContentScopes: [
                    { domain: "main", language: "en" },
                    { domain: "main", language: "de" },
                ],
            });

            const dimensions = await service.getAvailableContentScopeDimensions();

            expect(dimensions).toEqual([
                { name: "domain", label: "domain" },
                { name: "language", label: "language" },
            ]);
        });

        it("returns no dimensions when nothing is configured", async () => {
            const service = createService({});

            const dimensions = await service.getAvailableContentScopeDimensions();

            expect(dimensions).toEqual([]);
        });
    });

    describe("filterContentScopesForUser", () => {
        const options: UserPermissionsOptions = {
            availableContentScopes: [
                { domain: "main", language: "en" },
                { domain: "main", language: "de" },
            ],
            availableContentScopeDimensions: [{ name: "domain" }, { name: "language" }, { name: "product" }],
        };

        it("returns a manual content scope as-is, including a value for a dimension outside the available content scopes", async () => {
            const service = createService(options, { manualContentScopes: [{ domain: "main", language: "en", product: "product-42" }] });

            expect(await service.filterContentScopesForUser({ user, includeContentScopesManual: true })).toEqual([
                { domain: "main", language: "en", product: "product-42" },
            ]);
        });

        it("returns a manual content scope even when it is not part of the available content scopes", async () => {
            const service = createService(options, { manualContentScopes: [{ domain: "main", language: "fr", product: "product-42" }] });

            expect(await service.filterContentScopesForUser({ user, includeContentScopesManual: true })).toEqual([
                { domain: "main", language: "fr", product: "product-42" },
            ]);
        });

        it("represents access to all content scopes as a per-dimension wildcard spanning all declared dimensions", async () => {
            const service = createService(options, { getContentScopesForUser: () => UserPermissions.allContentScopes });

            expect(await service.filterContentScopesForUser({ user, includeContentScopesManual: false })).toEqual([
                { domain: "*", language: "*", product: "*" },
            ]);
        });
    });

    describe("isSystemUser", () => {
        it("returns true for an id listed in systemUsers", () => {
            const service = createService({ systemUsers: ["system", "cron"] });

            expect(service.isSystemUser("system")).toBe(true);
            expect(service.isSystemUser("cron")).toBe(true);
        });

        it("returns false for an id not listed in systemUsers", () => {
            const service = createService({ systemUsers: ["system"] });

            expect(service.isSystemUser("some-user-id")).toBe(false);
        });

        it("returns false when systemUsers is undefined", () => {
            const service = createService({});

            expect(service.isSystemUser("system")).toBe(false);
        });

        it("returns false when systemUsers is empty", () => {
            const service = createService({ systemUsers: [] });

            expect(service.isSystemUser("system")).toBe(false);
        });

        it("matches by exact id (no substring or case-insensitive match)", () => {
            const service = createService({ systemUsers: ["system"] });

            expect(service.isSystemUser("System")).toBe(false);
            expect(service.isSystemUser("system-user")).toBe(false);
            expect(service.isSystemUser("")).toBe(false);
        });
    });

    describe("findUser", () => {
        const foundUser: User = { id: "abc", name: "Max Mustermann", email: "max@example.com" };

        it("returns the user when userService resolves", async () => {
            const userService = { getUser: vi.fn().mockResolvedValue(foundUser), findUsers: vi.fn() };
            const service = createService({}, { userService });

            await expect(service.findUser("abc")).resolves.toEqual(foundUser);
            expect(userService.getUser).toHaveBeenCalledWith("abc");
        });

        it("returns null when userService rejects", async () => {
            const userService = { getUser: vi.fn().mockRejectedValue(new Error("not found")), findUsers: vi.fn() };
            const service = createService({}, { userService });

            await expect(service.findUser("missing")).resolves.toBeNull();
        });

        it("throws when userService is not configured", async () => {
            const service = createService({}, { userService: undefined });

            await expect(service.findUser("abc")).rejects.toThrow(/userService/);
        });
    });
});
