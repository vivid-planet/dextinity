import { createMock } from "@golevelup/ts-vitest";
import { describe, expect, it, vi } from "vitest";

import type { User } from "../user-permissions/interfaces/user";
import type { UserPermissionsService } from "../user-permissions/user-permissions.service";
import { ActionLogsUserLoaderService } from "./action-logs-user-loader.service";

const userA: User = { id: "a", name: "User A", email: "a@example.com" };

describe("ActionLogsUserLoaderService", () => {
    it("looks up each user once per request, without system users", async () => {
        const findUsersByIds = vi.fn().mockResolvedValue([userA]);
        const loader = new ActionLogsUserLoaderService(
            createMock<UserPermissionsService>({ findUsersByIds, isSystemUser: (userId: string) => userId === "system-user" }),
        );

        await expect(Promise.all([loader.load("a"), loader.load("a"), loader.load("system-user"), loader.load("missing")])).resolves.toEqual([
            { id: "a", name: "User A" },
            { id: "a", name: "User A" },
            { id: "system-user", name: "system-user" },
            { id: "missing" },
        ]);
        expect(findUsersByIds).toHaveBeenCalledTimes(1);
        expect(findUsersByIds).toHaveBeenCalledWith(["a", "missing"]);
    });

    it("doesn't look up users when a request loads only system users", async () => {
        const findUsersByIds = vi.fn();
        const loader = new ActionLogsUserLoaderService(createMock<UserPermissionsService>({ findUsersByIds, isSystemUser: () => true }));

        await expect(loader.load("system-user")).resolves.toEqual({ id: "system-user", name: "system-user" });
        expect(findUsersByIds).not.toHaveBeenCalled();
    });
});
