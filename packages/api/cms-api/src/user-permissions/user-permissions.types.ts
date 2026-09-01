import type { ModuleMetadata, Type } from "@nestjs/common";

import { CorePermission } from "../common/enum/core-permission.enum";
import type { CurrentUser } from "./dto/current-user";
import type { FindUsersArgs } from "./dto/paginated-user-list";
import type { UserPermission } from "./entities/user-permission.entity";
import type { ContentScope } from "./interfaces/content-scope.interface";
import type { User } from "./interfaces/user";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PermissionOverrides {} // This interface can be overwritten to add custom permissions
export type Permission = `${CorePermission}` | `${PermissionOverrides[keyof PermissionOverrides]}`; // convert enum to string union type
export enum UserPermissions {
    allContentScopes = "all-content-scopes",
    allPermissions = "all-permissions",
}

export type UserListItem = Pick<User, "id" | "name" | "email">;
export type Users = [UserListItem[], number];

export type SystemUser = string;

export type PermissionForUser = {
    permission: Permission;
    contentScopes?: ContentScope[];
} & Pick<UserPermission, "validFrom" | "validTo" | "reason" | "requestedBy" | "approvedBy">;
export type PermissionsForUser = PermissionForUser[] | UserPermissions.allPermissions;

export type ContentScopesForUser = ContentScope[] | UserPermissions.allContentScopes;

export interface AccessControlServiceInterface {
    isAllowed(user: CurrentUser | SystemUser, permission: Permission, contentScope?: ContentScope): boolean;
    getPermissionsForUser?: (user: User, availablePermissions: Permission[]) => Promise<PermissionsForUser> | PermissionsForUser;
    getContentScopesForUser?: (user: User) => Promise<ContentScopesForUser> | ContentScopesForUser;
}

export interface UserPermissionsUserServiceInterface {
    findUser?: (id: string) => Promise<User | null> | User | null;
    /**
     * Optional method to look up the user for login if a different code path from the default `findUser` is required.
     */
    findUserForLogin?: (id: string) => Promise<User | null> | User | null;
    /**
     * Optional method to look up the user for login if a different code path from the default `findUserOrThrow` is required.
     */
    findUserForLoginOrThrow?: (id: string) => Promise<User> | User;
    findUserOrThrow?: (id: string) => Promise<User> | User;
    findUsers: (args: FindUsersArgs) => Promise<Users> | Users;
    /**
     * @deprecated Implement `findUser` and `findUserOrThrow` instead.
     */
    getUser?: (id: string) => Promise<User> | User;
    /**
     * @deprecated Implement `findUserForLogin` and `findUserForLoginOrThrow` instead.
     */
    getUserForLogin?: (id: string) => Promise<User> | User;
    getAccountUrl?: (user: User) => Promise<string> | string;
}

export type ContentScopeWithLabel = {
    scope: ContentScope;
    label?: { [key in keyof ContentScope]?: string };
};
export type AvailableContentScope = ContentScope | ContentScopeWithLabel;

export interface UserPermissionsOptions {
    availableContentScopes?: AvailableContentScope[] | (() => Promise<AvailableContentScope[]> | AvailableContentScope[]);
    systemUsers?: string[];
}
export interface UserPermissionsModuleSyncOptions extends UserPermissionsOptions {
    UserService?: Type<UserPermissionsUserServiceInterface>;
    AccessControlService: Type<AccessControlServiceInterface>;
    AppPermission?: Record<string, string>;
}

export interface UserPermissionsAsyncOptions extends UserPermissionsOptions {
    userService?: UserPermissionsUserServiceInterface;
    accessControlService: AccessControlServiceInterface;
}

export interface UserPermissionsOptionsFactory {
    createUserPermissionsOptions(): Promise<UserPermissionsAsyncOptions> | UserPermissionsAsyncOptions;
}

export interface UserPermissionsModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: any[];
    useExisting?: Type<UserPermissionsOptionsFactory>;
    useClass?: Type<UserPermissionsOptionsFactory>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useFactory?: (...args: any[]) => Promise<UserPermissionsAsyncOptions> | UserPermissionsAsyncOptions;
    AppPermission?: Record<string, string>;
}

/**
 * Used to combine both the library and the application permissions into a single enum for the GraphQL schema. The application permissions are
 * injected into this enum at runtime in `UserPermissionsModule.registerCombinedPermission`.
 */
export const CombinedPermission: Record<string, string> = {
    ...CorePermission,
};

/**
 * Helper to register additional permissions into the permission enum used for the GraphQL schema.
 * Only use this if you're building a library that requires additional permissions.
 * For application-level permissions, use the `AppPermission` option in the module registration methods.
 *
 * @param additionalPermissions
 */
export const registerAdditionalPermissions = (additionalPermissions: Record<string, string>): void => {
    Object.entries(additionalPermissions).forEach(([key, value]) => {
        CombinedPermission[key] = value;
    });
};
