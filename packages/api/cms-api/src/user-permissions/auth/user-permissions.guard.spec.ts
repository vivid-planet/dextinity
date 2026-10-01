import { createMock } from "@golevelup/ts-vitest";
import { BaseEntity, defineConfig, Entity, MikroORM, PrimaryKey } from "@mikro-orm/postgresql";
import { ExecutionContext } from "@nestjs/common";
import { ModuleRef, Reflector } from "@nestjs/core";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DISABLE_DEXTINITY_GUARDS_METADATA_KEY } from "../../auth/decorators/disable-dextinity-guards.decorator";
import { DextinityValidationException } from "../../common/errors/validation.exception";
import { PageTreeService } from "../../page-tree/page-tree.service";
import { AbstractAccessControlService } from "../access-control.service";
import { ContentScopeService } from "../content-scope.service";
import { AFFECTED_ENTITY_METADATA_KEY, AffectedEntityMeta } from "../decorators/affected-entity.decorator";
import { AFFECTED_SCOPE_METADATA_KEY, AffectedScopeMeta } from "../decorators/affected-scope.decorator";
import { REQUIRED_PERMISSION_METADATA_KEY, RequiredPermissionMetadata } from "../decorators/required-permission.decorator";
import { SCOPED_ENTITY_METADATA_KEY, ScopedEntityMeta } from "../decorators/scoped-entity.decorator";
import { CurrentUser } from "../dto/current-user";
import { Permission } from "../user-permissions.types";
import { UserPermissionsGuard } from "./user-permissions.guard";

const permissions = {
    p1: "p1" as Permission,
    "p1.write": "p1.write" as Permission,
    p2: "p2" as Permission,
    p3: "p3" as Permission,
};

@Entity()
class TestEntity extends BaseEntity {
    @PrimaryKey()
    id: number;
}

@Entity()
class TestEntityWithUuidType extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string;
}

@Entity()
class TestEntityWithUuidColumnType extends BaseEntity {
    @PrimaryKey({ columnType: "uuid" })
    id: string;
}

class AccessControlService extends AbstractAccessControlService {}

describe("UserPermissionsGuard", () => {
    let guard: UserPermissionsGuard;
    let reflector: Reflector;
    let orm: MikroORM;
    let contentScopeService: ContentScopeService;
    let accessControlService: AccessControlService;
    let moduleRef: ModuleRef;

    const mockAnnotations = (annotations: {
        requiredPermission?: RequiredPermissionMetadata;
        affectedEntities?: AffectedEntityMeta[];
        scopedEntity?: ScopedEntityMeta<TestEntity>;
        disableDextinityGuards?: boolean;
        affectedScope?: AffectedScopeMeta;
    }) => {
        reflector.getAllAndOverride = vi.fn().mockImplementation((decorator: string) => {
            if (decorator === REQUIRED_PERMISSION_METADATA_KEY) {
                return annotations.requiredPermission;
            }
            if (decorator === AFFECTED_ENTITY_METADATA_KEY) {
                return annotations.affectedEntities;
            }
            if (decorator === SCOPED_ENTITY_METADATA_KEY) {
                return annotations.scopedEntity;
            }
            if (decorator === DISABLE_DEXTINITY_GUARDS_METADATA_KEY) {
                return annotations.disableDextinityGuards;
            }
            if (decorator === AFFECTED_SCOPE_METADATA_KEY) {
                return annotations.affectedScope;
            }
            return false;
        });
    };
    const mockContext = (options: { userPermissions?: CurrentUser["permissions"]; args?: unknown } = {}) => {
        return createMock<ExecutionContext>({
            switchToHttp: () => ({
                getRequest: () => ({
                    user: options.userPermissions
                        ? ({
                              id: "1",
                              name: "Admin",
                              email: "demo@dextinity.com",
                              permissions: options.userPermissions,
                          } satisfies CurrentUser)
                        : undefined,
                    params: options.args,
                }),
            }),
        });
    };
    const mockAffectedEntityValues = (values: { id: number | string; [key: string]: unknown }[]) => {
        orm.em.getRepository = vi
            .fn()
            .mockReturnValue({ findOneOrFail: vi.fn().mockImplementation((id: number | string) => values.find((v) => v.id === id)) });
    };

    beforeEach(async () => {
        reflector = new Reflector();
        orm = await MikroORM.init(
            defineConfig({
                dbName: "test-db",
                entities: [TestEntity, TestEntityWithUuidType, TestEntityWithUuidColumnType],
                connect: false,
                allowGlobalContext: true,
            }),
        );
        moduleRef = createMock<ModuleRef>();
        contentScopeService = new ContentScopeService(reflector, orm, moduleRef);
        accessControlService = new AccessControlService();
        guard = new UserPermissionsGuard(reflector, contentScopeService, accessControlService, {});
    });

    it("allows bypassing", async () => {
        mockAnnotations({
            disableDextinityGuards: true,
        });
        expect(await guard.canActivate(mockContext())).toBe(true);
    });

    it("denies if no user is provided", async () => {
        expect(await guard.canActivate(mockContext())).toBe(false);
    });

    it("allows user with exact permission", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: true },
            },
        });
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [] }],
                }),
            ),
        ).toBe(true);
    });

    it("allows user with at least one permission", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: true },
            },
        });
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [
                        { permission: permissions.p2, contentScopes: [] },
                        { permission: permissions.p1, contentScopes: [] },
                    ],
                }),
            ),
        ).toBe(true);
    });

    it("denies user with a wrong permission", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: true },
            },
        });
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p2, contentScopes: [] }],
                }),
            ),
        ).toBe(false);
    });

    it("denies user with only a partial permission", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: true },
            },
        });
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions["p1.write"], contentScopes: [] }],
                }),
            ),
        ).toBe(false);
    });

    it("denies user with empty permission", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: true },
            },
        });
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: "" as Permission, contentScopes: [] }],
                }),
            ),
        ).toBe(false);
    });

    it("denies user without permissions", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: true },
            },
        });
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [],
                }),
            ),
        ).toBe(false);
    });

    it("allows user with at least one of the required permissions", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1, permissions.p2], // One of the permissions is required
                options: { skipScopeCheck: true },
            },
        });
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [] }],
                }),
            ),
        ).toBe(true);
    });

    it("denies user without one of the required permissions", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1, permissions.p2], // One of the permissions is required
                options: { skipScopeCheck: true },
            },
        });
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p3, contentScopes: [] }],
                }),
            ),
        ).toBe(false);
    });

    it("allows user with scope", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: false },
            },
        });
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "a" }] }],
                    args: { scope: { a: "a" } },
                }),
            ),
        ).toBe(true);
    });

    it("allows user with scope when submitted scope is partial", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: false },
            },
        });
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "a", b: "b" }] }],
                    args: { scope: { a: "a" } },
                }),
            ),
        ).toBe(true); // It is explicitly allowed to have a partial scope (e.g. for operations using ScopeParts). To prevent allowing empty objects, the shape of the content scope object must be checked in another place (e.g. in the Input-Object of a graphql-resolver)
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "a", b: "b" }] }],
                    args: { scope: { a: "a", b: undefined } },
                }),
            ),
        ).toBe(false); // It is explicitly allowed to have a partial scope (e.g. for operations using ScopeParts). To prevent allowing empty objects, the shape of the content scope object must be checked in another place (e.g. in the Input-Object of a graphql-resolver)
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "a", b: "b" }] }],
                    args: { scope: { a: "a", b: null } },
                }),
            ),
        ).toBe(false); // null !== undefined
    });

    it("allows user with scope when submitted scope is empty", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: false },
            },
        });
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "a" }] }],
                    args: { scope: {} },
                }),
            ),
        ).toBe(true); // It is explicitly allowed to have a partial scope (e.g. for operations using ScopeParts). To prevent allowing empty objects, the shape of the content scope object must be checked in another place (e.g. in the Input-Object of a graphql-resolver)
    });

    it("denies user with wrong scope", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: false },
            },
        });
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "a" }] }],
                    args: { scope: { a: "b" } },
                }),
            ),
        ).toBe(false);
    });

    it("denies user with a partial scope", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: false },
            },
        });
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "a" }] }],
                    args: { scope: { a: "a", b: "b" } },
                }),
            ),
        ).toBe(false);
    });

    it("allows user by affected entity", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: false },
            },
            affectedEntities: [{ entity: TestEntity, options: { idArg: "id" } }],
        });
        mockAffectedEntityValues([
            { id: 1, scope: { a: "a" } },
            { id: 2, scope: { a: "b" } },
        ]);
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "a" }] }],
                    args: { id: 1 },
                }),
            ),
        ).toBe(true);
    });

    it("denies user with wrong scope by affected entity", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: false },
            },
            affectedEntities: [{ entity: TestEntity, options: { idArg: "id" } }],
        });
        mockAffectedEntityValues([
            { id: 1, scope: { a: "a" } },
            { id: 2, scope: { a: "b" } },
        ]);
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "b" }] }],
                    args: { id: 1 },
                }),
            ),
        ).toBe(false);
    });

    it("allows user by multiple affected entities", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: false },
            },
            affectedEntities: [{ entity: TestEntity, options: { idArg: "id" } }],
        });
        mockAffectedEntityValues([
            { id: 1, scope: { a: "a" } },
            { id: 2, scope: { a: "b" } },
        ]);
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "a" }, { a: "b" }] }],
                    args: { id: [1, 2] },
                }),
            ),
        ).toBe(true);
    });

    it("denies user without all requried scopes by multiple affected entities", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: false },
            },
            affectedEntities: [{ entity: TestEntity, options: { idArg: "id" } }],
        });
        mockAffectedEntityValues([
            { id: 1, scope: { a: "a" } },
            { id: 2, scope: { a: "b" } },
        ]);
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "a" }] }],
                    args: { id: [1, 2] },
                }),
            ),
        ).toBe(false);
    });

    it("allows user by affected entity with uuid primary key and valid uuid id", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: false },
            },
            affectedEntities: [{ entity: TestEntityWithUuidType, options: { idArg: "id" } }],
        });
        mockAffectedEntityValues([{ id: "7c0774c6-b482-4d75-b120-9c50e600e2a9", scope: { a: "a" } }]);
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "a" }] }],
                    args: { id: "7c0774c6-b482-4d75-b120-9c50e600e2a9" },
                }),
            ),
        ).toBe(true);
    });

    it("fails for malformed uuid id of affected entity with uuid primary key", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: false },
            },
            affectedEntities: [{ entity: TestEntityWithUuidType, options: { idArg: "id" } }],
        });
        mockAffectedEntityValues([]);
        await expect(
            guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "a" }] }],
                    args: { id: "not-a-uuid" },
                }),
            ),
        ).rejects.toThrowError(DextinityValidationException);
    });

    it("fails for malformed uuid id of affected entity with uuid column type", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: false },
            },
            affectedEntities: [{ entity: TestEntityWithUuidColumnType, options: { idArg: "id" } }],
        });
        mockAffectedEntityValues([]);
        await expect(
            guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "a" }] }],
                    args: { id: "not-a-uuid" },
                }),
            ),
        ).rejects.toThrowError(DextinityValidationException);
    });

    it("fails for one malformed uuid id among multiple ids of affected entity with uuid primary key", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: false },
            },
            affectedEntities: [{ entity: TestEntityWithUuidType, options: { idArg: "id" } }],
        });
        mockAffectedEntityValues([{ id: "7c0774c6-b482-4d75-b120-9c50e600e2a9", scope: { a: "a" } }]);
        await expect(
            guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "a" }] }],
                    args: { id: ["7c0774c6-b482-4d75-b120-9c50e600e2a9", "not-a-uuid"] },
                }),
            ),
        ).rejects.toThrowError(DextinityValidationException);
    });

    it("does not apply uuid validation for affected entity without uuid primary key", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: false },
            },
            affectedEntities: [{ entity: TestEntity, options: { idArg: "id" } }],
        });
        mockAffectedEntityValues([{ id: "not-a-uuid", scope: { a: "a" } }]);
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "a" }] }],
                    args: { id: "not-a-uuid" },
                }),
            ),
        ).toBe(true);
    });

    it("allows user by affected entity with valid uuid pageTreeNodeId", async () => {
        const pageTreeService = {
            createReadApi: () => ({
                getNode: (id: string) => ({ id, scope: { a: "a" } }),
            }),
        } as unknown as PageTreeService;
        const guardWithPageTree = new UserPermissionsGuard(
            reflector,
            new ContentScopeService(reflector, orm, moduleRef, pageTreeService),
            accessControlService,
            {},
        );
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: false },
            },
            affectedEntities: [{ entity: TestEntity, options: { pageTreeNodeIdArg: "pageTreeNodeId" } }],
        });
        expect(
            await guardWithPageTree.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "a" }] }],
                    args: { pageTreeNodeId: "7c0774c6-b482-4d75-b120-9c50e600e2a9" },
                }),
            ),
        ).toBe(true);
    });

    it("fails for malformed uuid pageTreeNodeId", async () => {
        const pageTreeService = {
            createReadApi: () => ({
                getNode: () => undefined,
            }),
        } as unknown as PageTreeService;
        const guardWithPageTree = new UserPermissionsGuard(
            reflector,
            new ContentScopeService(reflector, orm, moduleRef, pageTreeService),
            accessControlService,
            {},
        );
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: false },
            },
            affectedEntities: [{ entity: TestEntity, options: { pageTreeNodeIdArg: "pageTreeNodeId" } }],
        });
        await expect(
            guardWithPageTree.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "a" }] }],
                    args: { pageTreeNodeId: "not-a-uuid" },
                }),
            ),
        ).rejects.toThrowError(DextinityValidationException);
    });

    it("allows user by scoped entity", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: false },
            },
            affectedEntities: [{ entity: TestEntity, options: { idArg: "id" } }],
            scopedEntity: (_entity) => ({ a: "a" }),
        });
        mockAffectedEntityValues([{ id: 1 }]);
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "a" }] }],
                    args: { id: 1 },
                }),
            ),
        ).toBe(true);
    });

    it("denies user with wrong scope by scoped entity", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: false },
            },
            affectedEntities: [{ entity: TestEntity, options: { idArg: "id" } }],
            scopedEntity: (_entity) => ({ a: "a" }),
        });
        mockAffectedEntityValues([{ id: 1 }]);
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "b" }] }],
                    args: { id: 1 },
                }),
            ),
        ).toBe(false);
    });

    it("allows user by multiple scopes from one scoped entity", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: false },
            },
            affectedEntities: [{ entity: TestEntity, options: { idArg: "id" } }],
            scopedEntity: (_entity) => [{ a: "a" }, { a: "b" }], // One of the scopes is required
        });
        mockAffectedEntityValues([{ id: 1 }]);
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "a" }] }],
                    args: { id: 1 },
                }),
            ),
        ).toBe(true);
    });

    it("denies user with wrong scope by multiple scopes from one scoped entity", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: false },
            },
            affectedEntities: [{ entity: TestEntity, options: { idArg: "id" } }],
            scopedEntity: (_entity) => [{ a: "a" }, { a: "b" }], // One of the scopes is required
        });
        mockAffectedEntityValues([{ id: 1 }]);
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "c" }] }],
                    args: { id: 1 },
                }),
            ),
        ).toBe(false);
    });

    it("fails when RequiredPermission decorator is missing", async () => {
        mockAnnotations({});
        expect(async () =>
            guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [] }],
                }),
            ),
        ).rejects.toThrowError("RequiredPermission decorator is missing");
    });

    it("fails when RequiredPermission decorator has empty permissions", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [],
                options: { skipScopeCheck: true },
            },
        });
        expect(async () =>
            guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [] }],
                }),
            ),
        ).rejects.toThrowError("RequiredPermission decorator has empty permissions");
    });

    it("fails when Content Scope cannot be acquired", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: { skipScopeCheck: false },
            },
        });
        expect(async () =>
            guard.canActivate(
                mockContext({
                    userPermissions: [{ permission: permissions.p1, contentScopes: [{ a: "a" }] }],
                    args: {},
                }),
            ),
        ).rejects.toThrowError("Could not get content scope");
    });

    it("allows user by AffectedScope", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: undefined,
            },
            affectedScope: { argsToScope: (args) => ({ a: args.a }) },
        });
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [
                        {
                            permission: permissions.p1,
                            contentScopes: [{ a: 1 }],
                        },
                    ],
                    args: { a: 1 },
                }),
            ),
        ).toBe(true);
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [
                        {
                            permission: permissions.p1,
                            contentScopes: [{ a: 1 }],
                        },
                    ],
                    args: { a: 1, b: 2 },
                }),
            ),
        ).toBe(true);
    });

    it("allows user by multidimensional AffectedScope", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: undefined,
            },
            affectedScope: { argsToScope: (args) => ({ a: args.a, b: args.submittedB }) },
        });
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [
                        {
                            permission: permissions.p1,
                            contentScopes: [{ a: 1, b: "2" }],
                        },
                    ],
                    args: { a: 1, submittedB: "2" },
                }),
            ),
        ).toBe(true);
    });

    it("denies by wrong AffectedScope", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: undefined,
            },
            affectedScope: { argsToScope: (args) => ({ a: args.a }) },
        });
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [
                        {
                            permission: permissions.p1,
                            contentScopes: [{ a: 1 }],
                        },
                    ],
                    args: { a: 2 },
                }),
            ),
        ).toBe(false);
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [
                        {
                            permission: permissions.p1,
                            contentScopes: [{ a: 1 }],
                        },
                    ],
                    args: { a: "1" },
                }),
            ),
        ).toBe(false);
    });

    it("allows scope parts submitted by AffectedScope", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: undefined,
            },
            affectedScope: { argsToScope: (args) => ({ a: args.a }) },
        });
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [
                        {
                            permission: permissions.p1,
                            contentScopes: [{ a: 1, b: "2" }],
                        },
                    ],
                    args: { a: 1 }, // It is explicitly allowed to have a partial scope (e.g. for operations using ScopeParts). To prevent allowing empty objects, the shape of the content scope object must be checked in another place (e.g. in the Input-Object of a graphql-resolver)
                }),
            ),
        ).toBe(true);
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [
                        {
                            permission: permissions.p1,
                            contentScopes: [{ a: 1, b: "2" }],
                        },
                    ],
                    args: { a: 1, b: undefined }, // It is explicitly allowed to have a partial scope (e.g. for operations using ScopeParts). To prevent allowing empty objects, the shape of the content scope object must be checked in another place (e.g. in the Input-Object of a graphql-resolver)
                }),
            ),
        ).toBe(true);
    });

    it("denies by wrong multidimensional AffectedScope", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: undefined,
            },
            affectedScope: { argsToScope: (args) => ({ a: args.a, b: args.b }) },
        });
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [
                        {
                            permission: permissions.p1,
                            contentScopes: [{ a: 1, b: "2" }],
                        },
                    ],
                    args: { a: 1, b: null },
                }),
            ),
        ).toBe(false);
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [
                        {
                            permission: permissions.p1,
                            contentScopes: [{ a: 1 }, { b: "2" }], // User must have combination of a and b
                        },
                    ],
                    args: { a: 1, b: "2" },
                }),
            ),
        ).toBe(false);
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [
                        {
                            permission: permissions.p1,
                            contentScopes: [{ a: 1, b: "2" }],
                        },
                    ],
                    args: { a: 1, b: 2 },
                }),
            ),
        ).toBe(false);
    });

    it("allows user by AffectedScope returning multiple scopes when user has all scopes", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: undefined,
            },
            affectedScope: { argsToScope: (args) => [{ a: args.a }, { a: args.b }] },
        });
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [
                        {
                            permission: permissions.p1,
                            contentScopes: [{ a: 1 }, { a: 2 }],
                        },
                    ],
                    args: { a: 1, b: 2 },
                }),
            ),
        ).toBe(true);
    });

    it("denies by AffectedScope returning multiple scopes when user is missing any scope", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: undefined,
            },
            affectedScope: { argsToScope: (args) => [{ a: args.a }, { a: args.b }] },
        });
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [
                        {
                            permission: permissions.p1,
                            contentScopes: [{ a: 1 }], // Missing {a: 2}
                        },
                    ],
                    args: { a: 1, b: 2 },
                }),
            ),
        ).toBe(false);
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [
                        {
                            permission: permissions.p1,
                            contentScopes: [{ a: 2 }], // Missing {a: 1}
                        },
                    ],
                    args: { a: 1, b: 2 },
                }),
            ),
        ).toBe(false);
    });

    it("allows user by AffectedScope returning multiple multidimensional scopes when user has all scopes", async () => {
        mockAnnotations({
            requiredPermission: {
                requiredPermission: [permissions.p1],
                options: undefined,
            },
            affectedScope: {
                argsToScope: (args) => [
                    { a: args.a, b: args.b },
                    { a: args.c, b: args.d },
                ],
            },
        });
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [
                        {
                            permission: permissions.p1,
                            contentScopes: [
                                { a: 1, b: "x" },
                                { a: 2, b: "y" },
                            ],
                        },
                    ],
                    args: { a: 1, b: "x", c: 2, d: "y" },
                }),
            ),
        ).toBe(true);
        expect(
            await guard.canActivate(
                mockContext({
                    userPermissions: [
                        {
                            permission: permissions.p1,
                            contentScopes: [{ a: 1, b: "x" }], // Missing {a: 2, b: "y"}
                        },
                    ],
                    args: { a: 1, b: "x", c: 2, d: "y" },
                }),
            ),
        ).toBe(false);
    });
});
