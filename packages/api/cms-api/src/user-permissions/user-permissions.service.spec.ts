import type { DiscoveryService } from "@golevelup/nestjs-discovery";
import { createMock } from "@golevelup/ts-vitest";
import type { EntityRepository } from "@mikro-orm/postgresql";
import { describe, expect, it } from "vitest";

import type { UserContentScopes } from "./entities/user-content-scopes.entity";
import type { UserPermission } from "./entities/user-permission.entity";
import type { ContentScope } from "./interfaces/content-scope.interface";
import type { User } from "./interfaces/user";
import { UserPermissionsService } from "./user-permissions.service";
import type { AccessControlServiceInterface, UserPermissionsOptions } from "./user-permissions.types";

const user: User = { id: "1", name: "User", email: "user@example.com" };

function createService(
    options: UserPermissionsOptions,
    {
        getContentScopesForUser,
        manualContentScopes,
    }: { getContentScopesForUser?: AccessControlServiceInterface["getContentScopesForUser"]; manualContentScopes?: ContentScope[] } = {},
): UserPermissionsService {
    return new UserPermissionsService(
        options,
        undefined,
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
        it("returns the configured dimensions and humanizes missing labels", async () => {
            const service = createService({
                availableContentScopeDimensions: [{ name: "domain", label: "Domain" }, { name: "language" }, { name: "product" }],
            });

            const dimensions = await service.getAvailableContentScopeDimensions();

            expect(dimensions).toEqual([
                { name: "domain", label: "Domain" },
                { name: "language", label: "Language" },
                { name: "product", label: "Product" },
            ]);
        });

        it("resolves a factory function", async () => {
            const service = createService({
                availableContentScopeDimensions: () => [{ name: "domain" }],
            });

            const dimensions = await service.getAvailableContentScopeDimensions();

            expect(dimensions).toEqual([{ name: "domain", label: "Domain" }]);
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
                { name: "domain", label: "Domain" },
                { name: "language", label: "Language" },
            ]);
        });

        it("returns no dimensions when nothing is configured", async () => {
            const service = createService({});

            const dimensions = await service.getAvailableContentScopeDimensions();

            expect(dimensions).toEqual([]);
        });
    });

    describe("checkContentScopes", () => {
        function createServiceWithProductDimension(): UserPermissionsService {
            return createService({
                availableContentScopes: [
                    { domain: "main", language: "en" },
                    { domain: "main", language: "de" },
                ],
                availableContentScopeDimensions: [{ name: "domain" }, { name: "language" }, { name: "product" }],
            });
        }

        it("accepts a content scope that matches an available content scope", async () => {
            const service = createServiceWithProductDimension();

            await expect(service.checkContentScopes([{ domain: "main", language: "en" }])).resolves.toBeUndefined();
        });

        it("accepts a free value for a dimension that is not part of the available content scopes", async () => {
            const service = createServiceWithProductDimension();

            await expect(service.checkContentScopes([{ domain: "main", language: "en", product: "product-42" }])).resolves.toBeUndefined();
        });

        it("accepts the all-values wildcard for a dimension that is not part of the available content scopes", async () => {
            const service = createServiceWithProductDimension();

            await expect(service.checkContentScopes([{ domain: "main", language: "en", product: "*" }])).resolves.toBeUndefined();
        });

        it("rejects a content scope whose enumerable part does not exist", async () => {
            const service = createServiceWithProductDimension();

            await expect(service.checkContentScopes([{ domain: "secondary", language: "en", product: "product-42" }])).rejects.toThrow(
                "ContentScope does not exist",
            );
        });

        it("rejects a content scope with an unknown dimension", async () => {
            const service = createServiceWithProductDimension();

            await expect(service.checkContentScopes([{ domain: "main", language: "en", unknown: "value" }])).rejects.toThrow(
                'unknown dimension "unknown"',
            );
        });
    });

    describe("filterContentScopesForUser", () => {
        const availableContentScopes: ContentScope[] = [
            { domain: "main", language: "en" },
            { domain: "main", language: "de" },
        ];
        const options: UserPermissionsOptions = {
            availableContentScopes,
            availableContentScopeDimensions: [{ name: "domain" }, { name: "language" }, { name: "product" }],
        };

        it("keeps a manual content scope with a free value for a dimension outside the available content scopes", async () => {
            const service = createService(options, { manualContentScopes: [{ domain: "main", language: "en", product: "product-42" }] });

            expect(await service.filterContentScopesForUser({ user, availableContentScopes, includeContentScopesManual: true })).toEqual([
                { domain: "main", language: "en", product: "product-42" },
            ]);
        });

        it("drops a manual content scope whose enumerable part does not exist", async () => {
            const service = createService(options, { manualContentScopes: [{ domain: "main", language: "fr", product: "product-42" }] });

            expect(await service.filterContentScopesForUser({ user, availableContentScopes, includeContentScopesManual: true })).toEqual([]);
        });
    });
});
