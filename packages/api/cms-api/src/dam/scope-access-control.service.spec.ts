import { Test } from "@nestjs/testing";
import { describe, expect, it, vi } from "vitest";

import type { CurrentUser } from "../user-permissions/dto/current-user";
import { ACCESS_CONTROL_SERVICE } from "../user-permissions/user-permissions.constants";
import type { AccessControlServiceInterface } from "../user-permissions/user-permissions.types";
import { DAM_DISABLE_SCOPE_ACCESS_CONTROL } from "./dam.constants";
import { DamScopeAccessControlService } from "./scope-access-control.service";

const user = { id: "1" } as CurrentUser;
const scope = { domain: "main" };

function createAccessControlService(isAllowed: boolean): AccessControlServiceInterface {
    return { isAllowed: vi.fn().mockReturnValue(isAllowed) };
}

describe("DamScopeAccessControlService", () => {
    describe("onModuleInit", () => {
        it("throws when no access control service is available", () => {
            const service = new DamScopeAccessControlService(false, undefined);

            expect(() => service.onModuleInit()).toThrow(/no AccessControlService is available/);
        });

        it("passes when an access control service is available", () => {
            const service = new DamScopeAccessControlService(false, createAccessControlService(true));

            expect(() => service.onModuleInit()).not.toThrow();
        });

        it("passes without an access control service when the checks are disabled", () => {
            const service = new DamScopeAccessControlService(true, undefined);

            expect(() => service.onModuleInit()).not.toThrow();
        });
    });

    describe("isAllowed", () => {
        it("denies access when no access control service is available", () => {
            const service = new DamScopeAccessControlService(false, undefined);

            expect(service.isAllowed(user, scope)).toBe(false);
        });

        it("grants access when the check is disabled and no access control service is available", () => {
            const service = new DamScopeAccessControlService(true, undefined);

            expect(service.isAllowed(user, scope)).toBe(true);
        });

        it("asks the access control service for the dam permission", () => {
            const accessControlService = createAccessControlService(true);
            const service = new DamScopeAccessControlService(false, accessControlService);

            expect(service.isAllowed(user, scope)).toBe(true);
            expect(accessControlService.isAllowed).toHaveBeenCalledWith(user, "dam", scope);
        });

        it("denies access when the access control service denies it", () => {
            const service = new DamScopeAccessControlService(false, createAccessControlService(false));

            expect(service.isAllowed(user, scope)).toBe(false);
        });

        it("skips the access control service when the check is disabled", () => {
            const accessControlService = createAccessControlService(false);
            const service = new DamScopeAccessControlService(true, accessControlService);

            expect(service.isAllowed(user, scope)).toBe(true);
            expect(accessControlService.isAllowed).not.toHaveBeenCalled();
        });
    });

    // The assertion runs from a provider lifecycle hook, so it only stops the application if Nest calls it.
    describe("in a Nest module", () => {
        function createModule(providers: Parameters<typeof Test.createTestingModule>[0]["providers"]) {
            return Test.createTestingModule({ providers: [...(providers ?? []), DamScopeAccessControlService] }).compile();
        }

        it("fails to start when no access control service is registered", async () => {
            const moduleRef = await createModule([{ provide: DAM_DISABLE_SCOPE_ACCESS_CONTROL, useValue: false }]);

            await expect(moduleRef.init()).rejects.toThrow(/no AccessControlService is available/);
        });

        it("starts without an access control service when the checks are disabled", async () => {
            const moduleRef = await createModule([{ provide: DAM_DISABLE_SCOPE_ACCESS_CONTROL, useValue: true }]);

            await expect(moduleRef.init()).resolves.toBeDefined();
        });

        it("starts when an access control service is registered", async () => {
            const moduleRef = await createModule([
                { provide: DAM_DISABLE_SCOPE_ACCESS_CONTROL, useValue: false },
                { provide: ACCESS_CONTROL_SERVICE, useValue: createAccessControlService(true) },
            ]);

            await expect(moduleRef.init()).resolves.toBeDefined();
        });
    });
});
