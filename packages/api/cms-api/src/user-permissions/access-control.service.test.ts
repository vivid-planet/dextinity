import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it } from "vitest";

import { AbstractAccessControlService } from "./access-control.service";
import type { CurrentUser } from "./dto/current-user";
import type { Permission } from "./user-permissions.types";

const permissions = {
    p1: "p1" as Permission,
    p2: "p2" as Permission,
};

describe("AbstractAccessControlService", () => {
    class ConcreteAccessControlService extends AbstractAccessControlService {}

    let service: ConcreteAccessControlService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ConcreteAccessControlService],
        }).compile();

        service = module.get<ConcreteAccessControlService>(ConcreteAccessControlService);
    });

    describe("isAllowed", () => {
        it("should treat null and undefined scope dimensions the same", () => {
            const user: CurrentUser = {
                id: "b26d86a7-32bb-4c84-ab9d-d167dddd40ff",
                name: "User",
                email: "user@example.com",
                permissions: [{ permission: "pageTree", contentScopes: [{ domain: "main", language: null }] }],
            };

            expect(service.isAllowed(user, "pageTree", { domain: "main" })).toBe(true);

            expect(service.isAllowed(user, "pageTree", { domain: "main", language: null })).toBe(true);

            expect(service.isAllowed(user, "pageTree", { domain: "main", language: undefined })).toBe(true);
        });

        it("should allow any value for a wildcard scope dimension", () => {
            const user: CurrentUser = {
                id: "b26d86a7-32bb-4c84-ab9d-d167dddd40ff",
                name: "User",
                email: "user@example.com",
                permissions: [{ permission: "pageTree", contentScopes: [{ domain: "main", language: "*" }] }],
            };

            expect(service.isAllowed(user, "pageTree", { domain: "main", language: "en" })).toBe(true);
            expect(service.isAllowed(user, "pageTree", { domain: "main", language: "de" })).toBe(true);
            expect(service.isAllowed(user, "pageTree", { domain: "main" })).toBe(true);

            // The wildcard only applies to its dimension, other dimensions must still match
            expect(service.isAllowed(user, "pageTree", { domain: "secondary", language: "en" })).toBe(false);
        });
    });

    describe("isEqualOrMorePermissions", () => {
        it("should be false on fewer permissions", () => {
            expect(AbstractAccessControlService.isEqualOrMorePermissions([], [{ permission: permissions.p1, contentScopes: [] }])).toBe(false);
            expect(
                AbstractAccessControlService.isEqualOrMorePermissions(
                    [{ permission: permissions.p1, contentScopes: [] }],
                    [
                        { permission: permissions.p1, contentScopes: [] },
                        { permission: permissions.p2, contentScopes: [] },
                    ],
                ),
            ).toBe(false);
            expect(
                AbstractAccessControlService.isEqualOrMorePermissions(
                    [{ permission: permissions.p1, contentScopes: [] }],
                    [{ permission: permissions.p1, contentScopes: [{ domain: "main" }] }],
                ),
            ).toBe(false);
            expect(
                AbstractAccessControlService.isEqualOrMorePermissions(
                    [{ permission: permissions.p1, contentScopes: [{ domain: "main" }] }],
                    [{ permission: permissions.p1, contentScopes: [{ domain: "main" }, { domain: "secondary" }] }],
                ),
            ).toBe(false);
        });

        it("should be false on wrong permissions", () => {
            expect(
                AbstractAccessControlService.isEqualOrMorePermissions(
                    [{ permission: permissions.p1, contentScopes: [] }],
                    [{ permission: permissions.p2, contentScopes: [] }],
                ),
            ).toBe(false);
            expect(
                AbstractAccessControlService.isEqualOrMorePermissions(
                    [{ permission: permissions.p1, contentScopes: [{ domain: "main" }] }],
                    [{ permission: permissions.p1, contentScopes: [{ domain: "secondary" }] }],
                ),
            ).toBe(false);
            expect(
                AbstractAccessControlService.isEqualOrMorePermissions(
                    [{ permission: permissions.p1, contentScopes: [{ domain: "main" }] }],
                    [{ permission: permissions.p1, contentScopes: [{ domain: "main", language: "english" }] }],
                ),
            ).toBe(false);
            expect(
                AbstractAccessControlService.isEqualOrMorePermissions(
                    [{ permission: permissions.p1, contentScopes: [{ domain: "main", language: "english" }] }],
                    [{ permission: permissions.p1, contentScopes: [{ domain: "main" }] }],
                ),
            ).toBe(false);
            expect(
                AbstractAccessControlService.isEqualOrMorePermissions(
                    [{ permission: permissions.p1, contentScopes: [{ domain: "main" }] }],
                    [
                        { permission: permissions.p1, contentScopes: [{ domain: "secondary" }] },
                        { permission: permissions.p2, contentScopes: [{ domain: "main" }] },
                    ],
                ),
            ).toBe(false);
            expect(
                AbstractAccessControlService.isEqualOrMorePermissions(
                    [
                        { permission: permissions.p1, contentScopes: [{ domain: "secondary" }] },
                        { permission: permissions.p2, contentScopes: [{ domain: "main" }] },
                    ],
                    [{ permission: permissions.p1, contentScopes: [{ domain: "main" }] }],
                ),
            ).toBe(false);
        });

        it("should be true on equal permissions", () => {
            expect(AbstractAccessControlService.isEqualOrMorePermissions([], [])).toBe(true);
            expect(
                AbstractAccessControlService.isEqualOrMorePermissions(
                    [{ permission: permissions.p1, contentScopes: [] }],
                    [{ permission: permissions.p1, contentScopes: [] }],
                ),
            ).toBe(true);
            expect(
                AbstractAccessControlService.isEqualOrMorePermissions(
                    [{ permission: permissions.p1, contentScopes: [{ domain: "main" }] }],
                    [{ permission: permissions.p1, contentScopes: [{ domain: "main" }] }],
                ),
            ).toBe(true);
        });

        it("should be true on more permissions", () => {
            expect(AbstractAccessControlService.isEqualOrMorePermissions([{ permission: permissions.p1, contentScopes: [] }], [])).toBe(true);
            expect(
                AbstractAccessControlService.isEqualOrMorePermissions(
                    [{ permission: permissions.p1, contentScopes: [{ domain: "main" }, { domain: "secondary" }] }],
                    [{ permission: permissions.p1, contentScopes: [{ domain: "main" }] }],
                ),
            ).toBe(true);
            expect(
                AbstractAccessControlService.isEqualOrMorePermissions(
                    [
                        { permission: permissions.p1, contentScopes: [{ domain: "main" }, { domain: "secondary" }] },
                        { permission: permissions.p2, contentScopes: [{ domain: "main" }, { domain: "secondary" }] },
                    ],
                    [
                        { permission: permissions.p1, contentScopes: [{ domain: "main" }, { domain: "secondary" }] },
                        { permission: permissions.p2, contentScopes: [{ domain: "secondary" }] },
                    ],
                ),
            ).toBe(true);
        });
    });
});
