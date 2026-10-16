import { createMock } from "@golevelup/ts-vitest";
import { Entity, EntityManager, PrimaryKey, RawQueryFragment } from "@mikro-orm/postgresql";
import { ForbiddenException } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import { DiscoverService } from "../dependencies/discover.service";
import { AbstractAccessControlService } from "../user-permissions/access-control.service";
import { DisablePermissionCheck, RequiredPermission } from "../user-permissions/decorators/required-permission.decorator";
import { CurrentUser, CurrentUserPermission } from "../user-permissions/dto/current-user";
import { ContentScope } from "../user-permissions/interfaces/content-scope.interface";
import { UserPermissionsService } from "../user-permissions/user-permissions.service";
import { AccessControlServiceInterface, Permission } from "../user-permissions/user-permissions.types";
import { ActionLogsAclService } from "./action-logs.acl.service";
import { ActionLogs } from "./action-logs.decorator";
import { ActionLogsService } from "./action-logs.service";

@Entity()
@ActionLogs()
@RequiredPermission("news" as Permission)
class News {
    @PrimaryKey()
    id: number;
}

@Entity()
@ActionLogs()
@RequiredPermission("products" as Permission, { skipScopeCheck: true })
class Product {
    @PrimaryKey()
    id: number;
}

@Entity()
@ActionLogs()
@RequiredPermission(DisablePermissionCheck)
class PublicEntity {
    @PrimaryKey()
    id: number;
}

class AccessControlService extends AbstractAccessControlService {}

class GermanNewsDeniedAccessControlService extends AbstractAccessControlService {
    isAllowed(user: CurrentUser, permission: Permission, contentScope?: ContentScope): boolean {
        if (permission === ("news" as Permission) && (contentScope as { language?: string } | undefined)?.language === "de") {
            return false;
        }
        return super.isAllowed(user, permission, contentScope);
    }
}

const newsRowScopes: ContentScope[] = [
    { domain: "main", language: "en" },
    { domain: "main", language: "de" },
    { domain: "secondary", language: "en" },
];

const createEntityManager = () =>
    createMock<EntityManager>({
        getMetadata: () => ({ tableName: "ActionLog" }) as never,
        getConnection: () =>
            ({
                execute: async () => newsRowScopes.map((rowScope) => ({ entityName: "News", rowScope })),
            }) as never,
    });

const createAclService = (accessControlService: AccessControlServiceInterface = new AccessControlService()): ActionLogsAclService => {
    const actionLogsService = new ActionLogsService(
        createMock(),
        createMock(),
        createMock<DiscoverService>({ discoverTargetEntities: () => [News, Product, PublicEntity].map((entity) => ({ entity })) as never }),
    );
    actionLogsService.onModuleInit();
    return new ActionLogsAclService(
        createEntityManager(),
        actionLogsService,
        createMock<UserPermissionsService>({ isSystemUser: (id: string) => id === "system-user" }),
        accessControlService,
    );
};

const actionLogPermission: CurrentUserPermission = { permission: "actionLog" as Permission, contentScopes: [{ domain: "main" }] };

const user = (...permissions: CurrentUserPermission[]): CurrentUser =>
    ({ id: "1", name: "User", email: "user@example.com", permissions }) as CurrentUser;

const getEntityFilters = (filter: unknown) => (filter as { $or: Array<Record<string, unknown>> }).$or;

const getNewsFilter = (filter: unknown) => getEntityFilters(filter).find(({ entityName }) => entityName === "News");

const getAllowedNewsScopes = (filter: unknown): ContentScope[] => {
    const [, rowScopeCondition] = getNewsFilter(filter)?.$or as Array<Record<string, unknown>>;
    const [rawKey] = Object.keys(rowScopeCondition);
    return JSON.parse(RawQueryFragment.getKnownFragment(rawKey)?.params[0] as string);
};

describe("ActionLogsAclService", () => {
    const aclService = createAclService();

    it("does not restrict a system user", async () => {
        await expect(aclService.getReadableActionLogsFilter("system-user")).resolves.toEqual({});
    });

    it("denies an unknown system user", async () => {
        await expect(aclService.getReadableActionLogsFilter("other-user")).rejects.toThrow(ForbiddenException);
    });

    it("includes only entities whose permission the user holds and those that disable the check", async () => {
        const entityFilters = getEntityFilters(
            await aclService.getReadableActionLogsFilter(user(actionLogPermission, { permission: "products" as Permission, contentScopes: [] })),
        );

        expect(entityFilters.map(({ entityName }) => entityName)).toEqual(["Product", "PublicEntity"]);
    });

    it("does not restrict the scope of entities that skip the scope check or disable the permission check", async () => {
        const entityFilters = getEntityFilters(
            await aclService.getReadableActionLogsFilter(user(actionLogPermission, { permission: "products" as Permission, contentScopes: [] })),
        );

        expect(entityFilters).toEqual([{ entityName: "Product" }, { entityName: "PublicEntity" }]);
    });

    it("restricts scoped entities to unscoped rows and rows of the scopes the user is allowed in", async () => {
        const filter = await aclService.getReadableActionLogsFilter(
            user(actionLogPermission, { permission: "news" as Permission, contentScopes: [{ domain: "main", language: "en" }] }),
        );

        expect((getNewsFilter(filter)?.$or as unknown[])[0]).toEqual({ scope: null });
        expect(getAllowedNewsScopes(filter)).toEqual([{ domain: "main", language: "en" }]);
    });

    it("allows every row scope matched by a wildcard grant", async () => {
        const filter = await aclService.getReadableActionLogsFilter(
            user(actionLogPermission, { permission: "news" as Permission, contentScopes: [{ domain: "main", language: "*" }] }),
        );

        expect(getAllowedNewsScopes(filter)).toEqual([
            { domain: "main", language: "en" },
            { domain: "main", language: "de" },
        ]);
    });

    it("honors an access control service that denies a scope the grants cover", async () => {
        const filter = await createAclService(new GermanNewsDeniedAccessControlService()).getReadableActionLogsFilter(
            user(actionLogPermission, { permission: "news" as Permission, contentScopes: [{ domain: "main", language: "*" }] }),
        );

        expect(getAllowedNewsScopes(filter)).toEqual([{ domain: "main", language: "en" }]);
    });

    it("excludes scoped entities, including their unscoped rows, when the user is allowed in none of their row scopes", async () => {
        const entityFilters = getEntityFilters(
            await aclService.getReadableActionLogsFilter(user(actionLogPermission, { permission: "news" as Permission, contentScopes: [] })),
        );

        expect(entityFilters.map(({ entityName }) => entityName)).toEqual(["PublicEntity"]);
    });

    it("returns null when the user can read no entity besides those that disable the check", async () => {
        const aclServiceWithoutPublicEntity = new ActionLogsAclService(
            createEntityManager(),
            createMock<ActionLogsService>({ getLoggedEntities: () => [News] }),
            createMock<UserPermissionsService>(),
            new AccessControlService(),
        );

        await expect(aclServiceWithoutPublicEntity.getReadableActionLogsFilter(user(actionLogPermission))).resolves.toBeNull();
    });
});
