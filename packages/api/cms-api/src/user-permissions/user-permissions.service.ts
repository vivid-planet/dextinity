import { DiscoveryService } from "@golevelup/nestjs-discovery";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import { Inject, Injectable, Optional } from "@nestjs/common";
import { isFuture, isPast } from "date-fns";
import { Request } from "express";
import isEqual from "lodash.isequal";
import getUuid from "uuid-by-string";

import { AbstractAccessControlService } from "./access-control.service";
import { DisablePermissionCheck, REQUIRED_PERMISSION_METADATA_KEY, RequiredPermissionMetadata } from "./decorators/required-permission.decorator";
import { ContentScopeDimension, ContentScopeWithLabel } from "./dto/content-scope";
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

function camelCaseToHumanReadable(s: string | number) {
    const words = s.toString().match(/[A-Za-z0-9][a-z0-9]*/g) || [];
    return words.map((word) => word.charAt(0).toUpperCase() + word.substring(1)).join(" ");
}

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
        return contentScopesWithLabel;
    }

    async getAvailableContentScopeDimensions(): Promise<ContentScopeDimension[]> {
        if (this.options.availableContentScopeDimensions) {
            const dimensions =
                typeof this.options.availableContentScopeDimensions === "function"
                    ? await this.options.availableContentScopeDimensions()
                    : this.options.availableContentScopeDimensions;
            return dimensions.map((dimension) => ({
                name: dimension.name,
                label: dimension.label ?? camelCaseToHumanReadable(dimension.name),
            }));
        }

        // Derive the dimensions from the keys of the available content scopes when not explicitly configured
        const dimensionNames = new Set((await this.getAvailableContentScopes()).flatMap((contentScope) => Object.keys(contentScope.scope)));
        return [...dimensionNames].map((name) => ({ name, label: camelCaseToHumanReadable(name) }));
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
        const availableContentScopes = (await this.getAvailableContentScopes()).map((cs) => cs.scope);
        const enumerableDimensions = this.getEnumerableDimensions(availableContentScopes);
        const allowedDimensions = new Set([
            ...enumerableDimensions,
            ...(await this.getAvailableContentScopeDimensions()).map((dimension) => dimension.name),
        ]);
        for (const scope of contentScopes) {
            for (const dimension of Object.keys(scope)) {
                if (!allowedDimensions.has(dimension)) {
                    throw new Error(`ContentScope has unknown dimension "${dimension}": ${JSON.stringify(scope)}.`);
                }
            }
            if (!this.matchesAvailableContentScope(scope, availableContentScopes, enumerableDimensions)) {
                throw new Error(`ContentScope does not exist: ${JSON.stringify(scope)}.`);
            }
        }
    }

    private getEnumerableDimensions(availableContentScopes: ContentScope[]): Set<string> {
        return new Set(availableContentScopes.flatMap((scope) => Object.keys(scope)));
    }

    /**
     * A content scope is valid if the part built from the enumerable dimensions (the dimensions present in the available content
     * scopes) matches an available content scope. Dimensions that are not part of the available content scopes (e.g. an optional
     * dimension with too many values to enumerate) may hold any value.
     */
    private matchesAvailableContentScope(scope: ContentScope, availableContentScopes: ContentScope[], enumerableDimensions: Set<string>): boolean {
        const enumerableScope = Object.fromEntries(
            Object.entries(scope as Record<string, unknown>).filter(([dimension]) => enumerableDimensions.has(dimension)),
        );
        return availableContentScopes.some((availableContentScope) => isEqual(availableContentScope, enumerableScope));
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

    private async filterContentScopesForUser({
        user,
        availableContentScopes,
        includeContentScopesManual,
        representAllContentScopesAsWildcard = false,
    }: {
        user: User;
        availableContentScopes: ContentScope[];
        includeContentScopesManual: boolean;
        representAllContentScopesAsWildcard?: boolean;
    }): Promise<ContentScope[]> {
        const enumerableDimensions = this.getEnumerableDimensions(availableContentScopes);
        const contentScopes: ContentScope[] = [];

        if (this.accessControlService.getContentScopesForUser) {
            const userContentScopes = await this.accessControlService.getContentScopesForUser(user);
            if (userContentScopes === UserPermissions.allContentScopes) {
                if (representAllContentScopesAsWildcard) {
                    // For the current user, represent access to all content scopes as a single scope that grants any
                    // value ("*") of every available dimension, so that the wildcard is preserved for content scope
                    // checks and permission comparison (impersonation) instead of being expanded to concrete scopes.
                    const dimensions = new Set(availableContentScopes.flatMap((contentScope) => Object.keys(contentScope)));
                    contentScopes.push(Object.fromEntries([...dimensions].map((dimension) => [dimension, "*"])));
                } else {
                    // For other uses (e.g. the content scopes list in the user permissions panel), expand access to all
                    // content scopes to the concrete available scopes.
                    contentScopes.push(...availableContentScopes);
                }
            } else {
                contentScopes.push(...userContentScopes);
            }
        }

        if (includeContentScopesManual) {
            const entity = await this.contentScopeRepository.findOne({ userId: user.id });
            if (entity) {
                contentScopes.push(
                    ...entity.contentScopes.filter((value) => this.matchesAvailableContentScope(value, availableContentScopes, enumerableDimensions)),
                );
            }
        }

        return contentScopes;
    }

    async getImpersonatedUser(authenticatedUser: User, request: Request): Promise<User | undefined> {
        if (request?.cookies["dextinity-impersonate-user-id"]) {
            const permissions = await this.getPermissions(authenticatedUser);
            if (permissions.find((permission) => permission.permission === "impersonation")) {
                try {
                    const user = await this.findUserOrThrow(request.cookies["dextinity-impersonate-user-id"]);
                    if (
                        AbstractAccessControlService.isEqualOrMorePermissions(
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
        const availableContentScopes = (await this.getAvailableContentScopes()).map((cs) => cs.scope);
        const userContentScopes = await this.filterContentScopesForUser({
            user,
            availableContentScopes,
            includeContentScopesManual: true,
            representAllContentScopesAsWildcard: true,
        });
        return (await this.getPermissions(user))
            .filter((p) => (!p.validFrom || isPast(p.validFrom)) && (!p.validTo || isFuture(p.validTo)))
            .reduce((acc: CurrentUser["permissions"], userPermission) => {
                const contentScopes = userPermission.overrideContentScopes ? userPermission.contentScopes : userContentScopes;
                const existingPermission = acc.find((p) => p.permission === userPermission.permission);
                if (existingPermission) {
                    existingPermission.contentScopes = [...existingPermission.contentScopes, ...contentScopes];
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
