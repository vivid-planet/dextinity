import { createMock } from "@golevelup/ts-vitest";
import { Entity, EntityManager, PostgreSqlDriver, PrimaryKey } from "@mikro-orm/postgresql";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { beforeEach, describe, expect, it } from "vitest";

import { DiscoverService } from "../dependencies/discover.service";
import { AbstractAccessControlService } from "../user-permissions/access-control.service";
import { DisablePermissionCheck, RequiredPermission } from "../user-permissions/decorators/required-permission.decorator";
import { CurrentUser } from "../user-permissions/dto/current-user";
import { UserPermissionsService } from "../user-permissions/user-permissions.service";
import { Permission } from "../user-permissions/user-permissions.types";
import { ActionLogs } from "./action-logs.decorator";
import { ActionLogsResolver } from "./action-logs.resolver";
import { ActionLogsService } from "./action-logs.service";
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

@Entity()
@ActionLogs()
@RequiredPermission("products" as Permission, { skipScopeCheck: true })
class UnscopedLoggedEntity {
    @PrimaryKey()
    id: number;
}

@Entity()
@ActionLogs()
@RequiredPermission("news" as Permission)
class UnregisteredLoggedEntity {
    @PrimaryKey()
    id: number;
}

@Entity()
@ActionLogs()
class LoggedEntityWithoutPermission {
    @PrimaryKey()
    id: number;
}

class AccessControlService extends AbstractAccessControlService {}

const createActionLogsService = (entities: unknown[]): ActionLogsService => {
    const service = new ActionLogsService(
        createMock(),
        createMock(),
        createMock<DiscoverService>({ discoverTargetEntities: () => entities.map((entity) => ({ entity })) as never }),
    );
    service.onModuleInit();
    return service;
};

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
            createMock<UserPermissionsService>({ isSystemUser: (id: string) => id === "system-user" }),
            createMock<PreviousActionLogLoaderService>(),
            createActionLogsService([LoggedEntity, PublicLoggedEntity, UnscopedLoggedEntity]),
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

    it("allows a system user", async () => {
        await expect(resolver.actionLogs(args, "system-user")).resolves.toMatchObject({ totalCount: 0 });
    });

    it("ignores the requested scope when the entity skips the scope check", async () => {
        await expect(
            resolver.actionLogs(
                { ...args, entity: UnscopedLoggedEntity.name },
                user("products" as Permission, [{ domain: "secondary", language: "en" }]),
            ),
        ).resolves.toMatchObject({ totalCount: 0 });
    });

    it("denies a user without the permission when the entity skips the scope check", async () => {
        await expect(
            resolver.actionLogs({ ...args, entity: UnscopedLoggedEntity.name }, user("news" as Permission, [{ domain: "main", language: "en" }])),
        ).rejects.toThrow(ForbiddenException);
    });

    it("rejects an entity that is not logged", async () => {
        await expect(resolver.actionLogs({ ...args, entity: "Unlogged" }, user("news" as Permission, [{ domain: "main" }]))).rejects.toThrow(
            BadRequestException,
        );
    });

    it("rejects a decorated entity that is not registered with MikroORM", async () => {
        await expect(
            resolver.actionLogs({ ...args, entity: UnregisteredLoggedEntity.name }, user("news" as Permission, [{ domain: "main", language: "en" }])),
        ).rejects.toThrow(BadRequestException);
    });

    it("fails on init when a logged entity declares no permission", () => {
        expect(() => createActionLogsService([LoggedEntityWithoutPermission])).toThrow(/missing a @RequiredPermission decorator/);
    });
});
