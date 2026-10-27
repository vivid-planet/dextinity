import type { ContentScope } from "../../core/server/index.js";

export type { ContentScope };

export interface PermissionGrant {
    permission: string;
    contentScopes: ContentScope[];
}

/** In grants, `"*"` matches every value of a scope dimension. */
export const anyScopeValue = "*";

export function isScopeWithin(scope: ContentScope, grantedScope: ContentScope): boolean {
    return Object.entries(scope).every(([dimension, value]) => grantedScope[dimension] === anyScopeValue || grantedScope[dimension] === value);
}

/**
 * Without a scope, checks whether the permission is granted in any scope, e.g. to decide whether to show a menu item.
 * Used on the server and in the admin, the server stays the authority.
 */
export function can(grants: PermissionGrant[], permission: string, scope?: ContentScope): boolean {
    return grants.some(
        (grant) =>
            grant.permission === permission &&
            (scope === undefined || grant.contentScopes.some((grantedScope) => isScopeWithin(scope, grantedScope))),
    );
}

/** The scopes of `availableScopes` the permission is granted in. */
export function allowedScopes(grants: PermissionGrant[], permission: string, availableScopes: ContentScope[]): ContentScope[] {
    return availableScopes.filter((scope) => can(grants, permission, scope));
}
