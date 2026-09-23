import { createMock } from "@golevelup/ts-vitest";
import type { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { describe, expect, it } from "vitest";

import type { UserPermission } from "./entities/user-permission.entity";
import { UserPermissionResolver } from "./user-permission.resolver";
import type { UserPermissionsService } from "./user-permissions.service";

function createResolver(removeAndFlush: EntityManager["removeAndFlush"]): UserPermissionResolver {
    return new UserPermissionResolver(
        createMock<UserPermissionsService>(),
        createMock<EntityRepository<UserPermission>>({ findOne: async () => ({ id: "1" }) as UserPermission }),
        createMock<EntityManager>({ removeAndFlush }),
    );
}

describe("UserPermissionResolver", () => {
    describe("userPermissionsDeletePermission", () => {
        it("resolves only after the permission is deleted", async () => {
            let finishDeletion: () => void = () => {};
            const resolver = createResolver(() => new Promise<void>((resolve) => (finishDeletion = resolve)));

            let resolved = false;
            const result = resolver.userPermissionsDeletePermission("1").then((value) => {
                resolved = true;
                return value;
            });
            await new Promise((resolve) => setTimeout(resolve, 0));
            expect(resolved).toBe(false);

            finishDeletion();
            await expect(result).resolves.toBe(true);
        });

        it("rejects when deleting the permission fails", async () => {
            const resolver = createResolver(async () => {
                throw new Error("Deletion failed");
            });

            await expect(resolver.userPermissionsDeletePermission("1")).rejects.toThrow("Deletion failed");
        });
    });
});
