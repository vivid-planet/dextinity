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

    describe("filterContentScopesForUser", () => {
        const availableContentScopes: ContentScope[] = [
            { domain: "main", language: "en" },
            { domain: "main", language: "de" },
        ];
        const options: UserPermissionsOptions = {
            availableContentScopes,
            availableContentScopeDimensions: [{ name: "domain" }, { name: "language" }, { name: "product" }],
        };

        it("returns a manual content scope as-is, including a value for a dimension outside the available content scopes", async () => {
            const service = createService(options, { manualContentScopes: [{ domain: "main", language: "en", product: "product-42" }] });

            expect(await service.filterContentScopesForUser({ user, availableContentScopes, includeContentScopesManual: true })).toEqual([
                { domain: "main", language: "en", product: "product-42" },
            ]);
        });

        it("returns a manual content scope even when it is not part of the available content scopes", async () => {
            const service = createService(options, { manualContentScopes: [{ domain: "main", language: "fr", product: "product-42" }] });

            expect(await service.filterContentScopesForUser({ user, availableContentScopes, includeContentScopesManual: true })).toEqual([
                { domain: "main", language: "fr", product: "product-42" },
            ]);
        });
    });
});
