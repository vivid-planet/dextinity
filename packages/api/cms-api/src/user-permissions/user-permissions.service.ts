import { DiscoveryService } from "@golevelup/nestjs-discovery";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import { Inject, Injectable, Optional } from "@nestjs/common";
import { isFuture, isPast } from "date-fns";
import { Request } from "express";
import isEqual from "lodash.isequal";
import uniqWith from "lodash.uniqwith";
import getUuid from "uuid-by-string";

import { AbstractAccessControlService } from "./access-control.service";
import { DisablePermissionCheck, REQUIRED_PERMISSION_METADATA_KEY, RequiredPermissionMetadata } from "./decorators/required-permission.decorator";
import { ContentScopeWithLabel } from "./dto/content-scope";
import { CurrentUser, CurrentUserPermission } from "./dto/current-user";
import { FindUsersArgs } from "./dto/paginated-user-list";
import { UserContentScopes } from "./entities/user-content-scopes.entity";
import { UserPermission, UserPermissionSource } from "./entities/user-permission.entity";
import { ContentScope } from "./interfaces/content-scope.interface";
import { User } from "./interfaces/user";
import { ACCESS_CONTROL_SERVICE, USER_PERMISSIONS_OPTIONS, USER_PERMISSIONS_USER_SERVICE } from "./user-permissions.constants";
import {
    AccessControlServiceInterface,
    AvailableContentScope,
    Permission,
    UserPermissions,
    UserPermissionsOptions,
    UserPermissionsUserServiceInterface,
} from "./user-permissions.types";

@Injectable()
export class UserPermissionsService {
    constructor(
        @Inject(USER_PERMISSIONS_OPTIONS) private readonly options: UserPermissionsOptions,
        @Inject(USER_PERMISSIONS_USER_SERVICE) @Optional() private readonly userService: UserPermissionsUserServiceInterface | undefined,
        @Inject(ACCESS_CONTROL_SERVICE) private readonly accessControlService: AccessControlServiceInterface,
        @InjectRepository(UserPermission) private readonly permissionRepository: EntityRepository<UserPermission>,
        @InjectRepository(UserContentScopes) private readonly contentScopeRepository: EntityRepository<UserContentScopes>,
        private readonly discoveryService: DiscoveryService,
    ) {}

    private manualPermissions: { userId: string; permission: Permission }[] | undefined;
    private availablePermissions: Permission[] | undefined;

    async getAvailableContentScopes(): Promise<ContentScopeWithLabel[]> {
        let contentScopes: AvailableContentScope[] = [];
        if (this.options.availableContentScopes) {
            if (typeof this.options.availableContentScopes === "function") {
                contentScopes = await this.options.availableContentScopes();
            } else {
                contentScopes = this.options.availableContentScopes;
            }
        }

        function camelCaseToHumanReadable(s: string | number) {
            const words = s.toString().match(/[A-Za-z0-9][a-z0-9]*/g) || [];
            return words.map((word) => word.charAt(0).toUpperCase() + word.substring(1)).join(" ");
        }

        const contentScopesWithLabel = contentScopes
            .map((contentScope) =>
                "scope" in contentScope
                    ? contentScope
                    : {
                          scope: contentScope,
                      },
            )
            .map((contentScope) => ({
                scope: contentScope.scope,
                label: Object.fromEntries(
                    Object.entries(contentScope.scope).map(([key, value]) => [
                        key,
                        contentScope.label && key in contentScope.label
                            ? (contentScope.label as Record<string, string>)[key]
                            : camelCaseToHumanReadable(value),
                    ]),
                ),
            }));
        return uniqWith(contentScopesWithLabel, (value: ContentScopeWithLabel, other: ContentScopeWithLabel) => isEqual(value.scope, other.scope));
    }

    async getAvailablePermissions(): Promise<Permission[]> {
        if (this.availablePermissions === undefined) {
            this.availablePermissions = [
                ...new Set(
                    [
                        ...(await this.discoveryService.providerMethodsWithMetaAtKey<RequiredPermissionMetadata>(REQUIRED_PERMISSION_METADATA_KEY)),
                        ...(await this.discoveryService.providersWithMetaAtKey<RequiredPermissionMetadata>(REQUIRED_PERMISSION_METADATA_KEY)),
                        ...(await this.discoveryService.controllerMethodsWithMetaAtKey<RequiredPermissionMetadata>(REQUIRED_PERMISSION_METADATA_KEY)),
                        ...(await this.discoveryService.controllersWithMetaAtKey<RequiredPermissionMetadata>(REQUIRED_PERMISSION_METADATA_KEY)),
                    ]
                        .flatMap((p) => p.meta.requiredPermission)
                        .concat(["prelogin"]) // Add permission to allow checking if a specific user has access to a site where preloginEnabled is true
                        .concat(["impersonation"])
                        .filter((p) => p !== DisablePermissionCheck)
                        .sort(),
                ),
            ];
        }
        return this.availablePermissions;
    }

    getUserService(): UserPermissionsUserServiceInterface | undefined {
        return this.userService;
    }

    async findUserForLoginOrThrow(id: string): Promise<User> {
        if (this.userService?.findUserForLoginOrThrow) {
            return this.userService.findUserForLoginOrThrow(id);
        }
        if (this.userService?.getUserForLogin) {
            return this.userService.getUserForLogin(id);
        }
        throw new Error(
            "For this functionality you need to define `findUserForLoginOrThrow` (or the deprecated `getUserForLogin`) in the userService.",
        );
    }

    async findUserOrThrow(id: string): Promise<User> {
        if (this.userService?.findUserOrThrow) {
            return this.userService.findUserOrThrow(id);
        }
        if (this.userService?.getUser) {
            return this.userService.getUser(id);
        }
        throw new Error("For this functionality you need to define `findUserOrThrow` (or the deprecated `getUser`) in the userService.");
    }

    async findUsers(args: FindUsersArgs): Promise<[User[], number]> {
        if (!this.userService) {
            throw new Error("For this functionality you need to define the userService in the UserPermissionsModule.");
        }
        return this.userService.findUsers(args);
    }

    async checkContentScopes(contentScopes: ContentScope[]): Promise<void> {
        const availableContentScopes = await this.getAvailableContentScopes();
        contentScopes.forEach((scope) => {
            if (!availableContentScopes.some((cs) => isEqual(cs.scope, scope))) {
                throw new Error(`ContentScope does not exist: ${JSON.stringify(scope)}.`);
            }
        });
    }

    async warmupHasPermissionCache() {
        this.manualPermissions = (await this.permissionRepository.find({ permission: { $in: await this.getAvailablePermissions() } }))
            .filter((p) => (!p.validFrom || isPast(p.validFrom)) && (!p.validTo || isFuture(p.validTo)))
            .map((p) => ({ userId: p.userId, permission: p.permission }));
    }

    async hasPermission(user: User, permission: Permission | Permission[]): Promise<boolean> {
        const permissions = Array.isArray(permission) ? permission : [permission];
        if (this.accessControlService.getPermissionsForUser) {
            const availablePermissions = await this.getAvailablePermissions();
            const permissionsByRule = await this.accessControlService.getPermissionsForUser(user, availablePermissions);
            if (permissionsByRule === UserPermissions.allPermissions) {
                if (availablePermissions.some((p) => permissions.includes(p))) {
                    return true;
                }
            } else {
                if (permissionsByRule.some((p) => permissions.includes(p.permission))) {
                    return true;
                }
            }
        }
        if (this.manualPermissions === undefined) {
            throw new Error('You need to call "warmupHasPermissionCache" before using "hasPermission" for the first time.');
        }
        if (this.manualPermissions.some((p) => p.userId === user.id && permissions.includes(p.permission))) {
            return true;
        }

        return false;
    }

    async getPermissions(user: User): Promise<UserPermission[]> {
        const availablePermissions = await this.getAvailablePermissions();
        const permissions = (
            await this.permissionRepository.find({
                $and: [{ userId: user.id }, { permission: { $in: availablePermissions } }],
            })
        ).map((p) => {
            p.source = UserPermissionSource.MANUAL;
            return p;
        });
        if (this.accessControlService.getPermissionsForUser) {
            if (user) {
                let permissionsByRule = await this.accessControlService.getPermissionsForUser(user, availablePermissions);
                if (permissionsByRule === UserPermissions.allPermissions) {
                    permissionsByRule = availablePermissions.map((permission) => ({ permission }));
                }
                for (const p of permissionsByRule) {
                    const permission = new UserPermission();
                    permission.id = getUuid(JSON.stringify(p));
                    permission.source = UserPermissionSource.BY_RULE;
                    permission.userId = user.id;
                    permission.overrideContentScopes = !!p.contentScopes;
                    permission.assign(p);
                    permissions.push(permission);
                }
            }
        }

        return permissions
            .filter((value) => availablePermissions.some((p) => p === value.permission)) // Filter out permissions that are not defined in availablePermissions (e.g. outdated database entries)
            .sort((a, b) => availablePermissions.indexOf(a.permission) - availablePermissions.indexOf(b.permission));
    }

    async getContentScopes(user: User, includeContentScopesManual = true): Promise<ContentScope[]> {
        const availableContentScopes = (await this.getAvailableContentScopes()).map((cs) => cs.scope);
        return this.filterContentScopesForUser({ user, availableContentScopes, includeContentScopesManual });
    }

    // Resolves the content scopes for many users while computing the (shared) available content scopes only once.
    // Used by the request-scoped UserContentScopesLoaderService so the contentScopesCount field resolver doesn't
    // recompute the full available-scope list once per returned user.
    async getContentScopesForUsers(users: User[], includeContentScopesManual = true): Promise<ContentScope[][]> {
        const availableContentScopes = (await this.getAvailableContentScopes()).map((cs) => cs.scope);
        return Promise.all(users.map((user) => this.filterContentScopesForUser({ user, availableContentScopes, includeContentScopesManual })));
    }

    private async filterContentScopesForUser({
        user,
        availableContentScopes,
        includeContentScopesManual,
    }: {
        user: User;
        availableContentScopes: ContentScope[];
        includeContentScopesManual: boolean;
    }): Promise<ContentScope[]> {
        const contentScopes: ContentScope[] = [];

        if (this.accessControlService.getContentScopesForUser) {
            const userContentScopes = await this.accessControlService.getContentScopesForUser(user);
            if (userContentScopes === UserPermissions.allContentScopes) {
                contentScopes.push(...availableContentScopes);
            } else {
                contentScopes.push(...userContentScopes);
            }
        }

        if (includeContentScopesManual) {
            const entity = await this.contentScopeRepository.findOne({ userId: user.id });
            if (entity) {
                contentScopes.push(...entity.contentScopes.filter((value) => availableContentScopes.some((cs) => isEqual(cs, value))));
            }
        }

        return uniqWith(contentScopes, isEqual);
    }

    async getImpersonatedUser(authenticatedUser: User, request: Request): Promise<User | undefined> {
        if (request?.cookies["dextinity-impersonate-user-id"]) {
            const permissions = await this.getPermissions(authenticatedUser);
            if (permissions.find((permission) => permission.permission === "impersonation")) {
                try {
                    const user = await this.findUserOrThrow(request.cookies["dextinity-impersonate-user-id"]);
                    if (
                        await AbstractAccessControlService.isEqualOrMorePermissions(
                            await this.getPermissionsAndContentScopes(authenticatedUser),
                            await this.getPermissionsAndContentScopes(user),
                        )
                    ) {
                        return user;
                    }
                } catch {
                    return undefined;
                }
            }
        }
    }

    async createCurrentUser(authenticatedUser: User, request?: Request): Promise<CurrentUser> {
        const impersonatedUser = request && (await this.getImpersonatedUser(authenticatedUser, request));
        const user = impersonatedUser || authenticatedUser;

        return {
            ...user,
            permissions: await this.getPermissionsAndContentScopes(user),
            impersonated: !!impersonatedUser,
            authenticatedUser: impersonatedUser ? authenticatedUser : undefined,
            accountUrl: this.userService?.getAccountUrl ? await this.userService.getAccountUrl(user) : undefined,
        };
    }

    async getPermissionsAndContentScopes(user: User): Promise<CurrentUserPermission[]> {
        const userContentScopes = await this.getContentScopes(user);
        return (await this.getPermissions(user))
            .filter((p) => (!p.validFrom || isPast(p.validFrom)) && (!p.validTo || isFuture(p.validTo)))
            .reduce((acc: CurrentUser["permissions"], userPermission) => {
                const contentScopes = userPermission.overrideContentScopes ? userPermission.contentScopes : userContentScopes;
                const existingPermission = acc.find((p) => p.permission === userPermission.permission);
                if (existingPermission) {
                    existingPermission.contentScopes = uniqWith([...existingPermission.contentScopes, ...contentScopes], isEqual);
                } else {
                    acc.push({
                        permission: userPermission.permission,
                        contentScopes,
                    });
                }
                return acc;
            }, []);
    }
}
