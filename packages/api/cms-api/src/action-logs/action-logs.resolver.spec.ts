import { createMock } from "@golevelup/ts-vitest";
import { Entity, EntityManager, PostgreSqlDriver, PrimaryKey } from "@mikro-orm/postgresql";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { beforeEach, describe, expect, it } from "vitest";

import { AbstractAccessControlService } from "../user-permissions/access-control.service";
import { DisablePermissionCheck, RequiredPermission } from "../user-permissions/decorators/required-permission.decorator";
import { CurrentUser } from "../user-permissions/dto/current-user";
import { UserPermissionsService } from "../user-permissions/user-permissions.service";
import { Permission } from "../user-permissions/user-permissions.types";
import { ActionLogs } from "./action-logs.decorator";
import { ActionLogsResolver } from "./action-logs.resolver";
import { PreviousActionLogLoaderService } from "./previous-action-log-loader.service";

@Entity()
@ActionLogs()
@RequiredPermission("news" as Permission)
class LoggedEntity {
    @PrimaryKey()
    id: number;
}

@Entity()
@ActionLogs()
@RequiredPermission(DisablePermissionCheck)
class PublicLoggedEntity {
    @PrimaryKey()
    id: number;
}

class AccessControlService extends AbstractAccessControlService {}

const user = (permission: Permission, contentScopes: Array<Record<string, string>>): CurrentUser =>
    ({
        id: "1",
        name: "User",
        email: "user@example.com",
        permissions: [{ permission, contentScopes }],
    }) as CurrentUser;

describe("ActionLogsResolver", () => {
    let resolver: ActionLogsResolver;

    const args = {
        entity: LoggedEntity.name,
        scope: { domain: "main", language: "en" },
        offset: 0,
        limit: 25,
    };

    beforeEach(() => {
        resolver = new ActionLogsResolver(
            createMock<EntityManager<PostgreSqlDriver>>({ findAndCount: async () => [[], 0] as [never[], number] }),
            createMock<UserPermissionsService>(),
            createMock<PreviousActionLogLoaderService>(),
            new AccessControlService(),
        );
    });

    it("allows a user holding the entity's permission in the requested scope", async () => {
        await expect(resolver.actionLogs(args, user("news" as Permission, [{ domain: "main", language: "en" }]))).resolves.toMatchObject({
            totalCount: 0,
        });
    });

    it("denies a user holding the permission in a different scope", async () => {
        await expect(resolver.actionLogs(args, user("news" as Permission, [{ domain: "secondary", language: "en" }]))).rejects.toThrow(
            ForbiddenException,
        );
    });

    it("denies a user holding a different permission", async () => {
        await expect(resolver.actionLogs(args, user("products" as Permission, [{ domain: "main", language: "en" }]))).rejects.toThrow(
            ForbiddenException,
        );
    });

    it("allows any user when the entity disables the permission check", async () => {
        await expect(resolver.actionLogs({ ...args, entity: PublicLoggedEntity.name }, user("products" as Permission, []))).resolves.toMatchObject({
            totalCount: 0,
        });
    });

    it("rejects an entity that is not logged", async () => {
        await expect(resolver.actionLogs({ ...args, entity: "Unlogged" }, user("news" as Permission, [{ domain: "main" }]))).rejects.toThrow(
            BadRequestException,
        );
    });
});
