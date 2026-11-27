import { createMock } from "@golevelup/ts-vitest";
import { Entity, PrimaryKey } from "@mikro-orm/decorators/legacy";
import { EntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DiscoverService } from "../dependencies/discover.service.js";
import { AbstractAccessControlService } from "../user-permissions/access-control.service.js";
import { DisablePermissionCheck, RequiredPermission } from "../user-permissions/decorators/required-permission.decorator.js";
import { ScopedEntity } from "../user-permissions/decorators/scoped-entity.decorator.js";
import { CurrentUser } from "../user-permissions/dto/current-user.js";
import type { ContentScope } from "../user-permissions/interfaces/content-scope.interface.js";
import { UserPermissionsService } from "../user-permissions/user-permissions.service.js";
import type { Permission } from "../user-permissions/user-permissions.types.js";
import { ActionLogsAclService } from "./action-logs.acl.service.js";
import { ActionLogs } from "./action-logs.decorator.js";
import { ActionLogsResolver } from "./action-logs.resolver.js";
import { ActionLogsService } from "./action-logs.service.js";
import { ActionLogsUserLoaderService } from "./action-logs-user-loader.service.js";
import { ActionLog } from "./entities/action-log.entity.js";
import { PreviousActionLogLoaderService } from "./previous-action-log-loader.service.js";

@Entity()
@ActionLogs()
@RequiredPermission("news" as Permission)
@ScopedEntity(() => ({ domain: "main", language: "en" }))
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
@ScopedEntity(() => ({ domain: "main", language: "en" }))
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
        createMock<DiscoverService>({ discoverTargetEntities: () => entities.map((entity) => ({ entity, metadata: { properties: {} } })) as never }),
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
    let findAndCount: ReturnType<typeof vi.fn>;
    let loadPreviousVersion: ReturnType<typeof vi.fn>;
    let queryBuilder: Record<"select" | "where" | "orderBy" | "execute", ReturnType<typeof vi.fn>>;

    const getScopeCondition = () => (findAndCount.mock.calls[0][1] as { $and: Array<Record<string, unknown>> }).$and[1];

    const args = {
        entity: LoggedEntity.name,
        scope: { domain: "main", language: "en" },
        offset: 0,
        limit: 25,
    };

    beforeEach(() => {
        const userPermissionsService = createMock<UserPermissionsService>({ isSystemUser: (id: string) => id === "system-user" });
        const actionLogsService = createActionLogsService([LoggedEntity, UnscopedLoggedEntity]);
        findAndCount = vi.fn(async () => [[], 0] as [never[], number]);
        loadPreviousVersion = vi.fn();
        queryBuilder = {
            select: vi.fn(() => queryBuilder),
            where: vi.fn(() => queryBuilder),
            orderBy: vi.fn(() => queryBuilder),
            execute: vi.fn(async () => [{ entityName: UnscopedLoggedEntity.name }]),
        };
        resolver = new ActionLogsResolver(
            createMock<EntityManager<PostgreSqlDriver>>({ findAndCount: findAndCount as never, createQueryBuilder: (() => queryBuilder) as never }),
            userPermissionsService,
            createMock<PreviousActionLogLoaderService>({ load: loadPreviousVersion as never }),
            createMock<ActionLogsUserLoaderService>(),
            createActionLogsService([LoggedEntity, PublicLoggedEntity, UnscopedLoggedEntity]),
            new ActionLogsAclService(createMock<EntityManager>(), actionLogsService, userPermissionsService, new AccessControlService()),
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

    it("denies a user when the entity disables the permission check", async () => {
        await expect(resolver.actionLogs({ ...args, entity: PublicLoggedEntity.name }, user("news" as Permission, [args.scope]))).rejects.toThrow(
            ForbiddenException,
        );
    });

    it("allows a system user when the entity disables the permission check", async () => {
        await expect(resolver.actionLogs({ ...args, entity: PublicLoggedEntity.name }, "system-user")).resolves.toMatchObject({ totalCount: 0 });
    });

    it("allows a system user", async () => {
        await expect(resolver.actionLogs(args, "system-user")).resolves.toMatchObject({ totalCount: 0 });
    });

    it("does not return the unscoped rows of an entity that checks the scope", async () => {
        await resolver.actionLogs(args, user("news" as Permission, [args.scope]));

        expect(getScopeCondition()).not.toHaveProperty("$or");
        expect(getScopeCondition()).toHaveProperty("scope.$contains", [args.scope]);
    });

    it("returns the unscoped rows of an entity that skips the scope check", async () => {
        await resolver.actionLogs({ ...args, entity: UnscopedLoggedEntity.name }, user("products" as Permission, []));

        expect(getScopeCondition().$or).toContainEqual({ scope: null });
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

    it("returns an empty page of all action logs when the user can read no entity", async () => {
        await expect(
            resolver.myActionLogs({ offset: 0, limit: 25 }, user("actionLog" as Permission, [{ domain: "main", language: "en" }])),
        ).resolves.toMatchObject({ nodes: [], totalCount: 0 });
    });

    it("returns no entity names when the user can read no entity", async () => {
        await expect(resolver.myActionLogEntityNames(user("actionLog" as Permission, [{ domain: "main", language: "en" }]))).resolves.toEqual([]);
        expect(queryBuilder.execute).not.toHaveBeenCalled();
    });

    it("returns the distinct entity names of the entries the user can read", async () => {
        await expect(resolver.myActionLogEntityNames(user("products" as Permission, []))).resolves.toEqual([UnscopedLoggedEntity.name]);
        expect(queryBuilder.select).toHaveBeenCalledWith("entityName", true);
        expect(queryBuilder.where).toHaveBeenCalledWith({ $or: [{ entityName: UnscopedLoggedEntity.name }] });
    });

    it("fails on init when a logged entity declares no permission", () => {
        expect(() => createActionLogsService([LoggedEntityWithoutPermission])).toThrow(/missing a @RequiredPermission decorator/);
    });

    describe("previousVersion", () => {
        const currentVersion = (entityName: string) => ({ entityName, entityId: "1", version: 2, scope: [args.scope] }) as unknown as ActionLog;
        const previousRow = (entityName: string, scope?: ContentScope[]) => ({ entityName, scope, version: 1 }) as ActionLog;

        it("does not return an unscoped previous version of an entity that checks the scope", async () => {
            loadPreviousVersion.mockResolvedValue(previousRow(LoggedEntity.name));

            await expect(resolver.previousVersion(currentVersion(LoggedEntity.name))).resolves.toBeNull();
        });

        it("returns an unscoped previous version of an entity that skips the scope check", async () => {
            const previous = previousRow(UnscopedLoggedEntity.name);
            loadPreviousVersion.mockResolvedValue(previous);

            await expect(resolver.previousVersion(currentVersion(UnscopedLoggedEntity.name))).resolves.toBe(previous);
        });

        it("returns a previous version that holds the scopes of the current one", async () => {
            const previous = previousRow(LoggedEntity.name, [args.scope]);
            loadPreviousVersion.mockResolvedValue(previous);

            await expect(resolver.previousVersion(currentVersion(LoggedEntity.name))).resolves.toBe(previous);
        });
    });
});
