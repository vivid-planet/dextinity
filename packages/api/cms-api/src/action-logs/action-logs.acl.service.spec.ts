import { createMock } from "@golevelup/ts-vitest";
import { Entity, PrimaryKey } from "@mikro-orm/postgresql";
import { ForbiddenException } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import { DiscoverService } from "../dependencies/discover.service";
import { DisablePermissionCheck, RequiredPermission } from "../user-permissions/decorators/required-permission.decorator";
import { CurrentUser, CurrentUserPermission } from "../user-permissions/dto/current-user";
import { UserPermissionsService } from "../user-permissions/user-permissions.service";
import { Permission } from "../user-permissions/user-permissions.types";
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

const createAclService = (): ActionLogsAclService => {
    const actionLogsService = new ActionLogsService(
        createMock(),
        createMock(),
        createMock<DiscoverService>({ discoverTargetEntities: () => [News, Product, PublicEntity].map((entity) => ({ entity })) as never }),
    );
    actionLogsService.onModuleInit();
    return new ActionLogsAclService(actionLogsService, createMock<UserPermissionsService>({ isSystemUser: (id: string) => id === "system-user" }));
};

const actionLogPermission: CurrentUserPermission = { permission: "actionLog" as Permission, contentScopes: [{ domain: "main" }] };

const user = (...permissions: CurrentUserPermission[]): CurrentUser =>
    ({ id: "1", name: "User", email: "user@example.com", permissions }) as CurrentUser;

const getEntityFilters = (filter: unknown) => (filter as { $or: Array<Record<string, unknown>> }).$or;

describe("ActionLogsAclService", () => {
    const aclService = createAclService();

    it("does not restrict a system user", () => {
        expect(aclService.getReadableActionLogsFilter("system-user")).toEqual({});
    });

    it("denies an unknown system user", () => {
        expect(() => aclService.getReadableActionLogsFilter("other-user")).toThrow(ForbiddenException);
    });

    it("includes only entities whose permission the user holds and those that disable the check", () => {
        const entityFilters = getEntityFilters(
            aclService.getReadableActionLogsFilter(user(actionLogPermission, { permission: "products" as Permission, contentScopes: [] })),
        );

        expect(entityFilters.map(({ entityName }) => entityName)).toEqual(["Product", "PublicEntity"]);
    });

    it("does not restrict the scope of entities that skip the scope check or disable the permission check", () => {
        const entityFilters = getEntityFilters(
            aclService.getReadableActionLogsFilter(user(actionLogPermission, { permission: "products" as Permission, contentScopes: [] })),
        );

        expect(entityFilters).toEqual([{ entityName: "Product" }, { entityName: "PublicEntity" }]);
    });

    it("restricts scoped entities to unscoped rows and rows within the user's content scopes", () => {
        const [newsFilter] = getEntityFilters(
            aclService.getReadableActionLogsFilter(
                user(actionLogPermission, { permission: "news" as Permission, contentScopes: [{ domain: "main" }] }),
            ),
        );

        expect(newsFilter.entityName).toBe("News");
        const scopeConditions = newsFilter.$or as Array<Record<string, unknown>>;
        expect(scopeConditions[0]).toEqual({ scope: null });
        expect(scopeConditions).toHaveLength(2);
    });

    it("restricts scoped entities to unscoped rows when the user holds the permission in no content scope", () => {
        const [newsFilter] = getEntityFilters(
            aclService.getReadableActionLogsFilter(user(actionLogPermission, { permission: "news" as Permission, contentScopes: [] })),
        );

        expect(newsFilter).toEqual({ entityName: "News", $or: [{ scope: null }] });
    });

    it("returns null when the user can read no entity besides those that disable the check", () => {
        const aclServiceWithoutPublicEntity = new ActionLogsAclService(
            createMock<ActionLogsService>({ getLoggedEntities: () => [News] }),
            createMock<UserPermissionsService>(),
        );

        expect(aclServiceWithoutPublicEntity.getReadableActionLogsFilter(user(actionLogPermission))).toBeNull();
    });
});
