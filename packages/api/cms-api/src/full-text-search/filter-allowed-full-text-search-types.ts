import type { FullTextSearchPermission } from "./build-full-text-search-where";
import type { FullTextSearchTypeDefinition } from "./full-text-search.service";

/**
 * Keeps the types for which one of the `permissions` is a required permission, in any content scope.
 */
export function filterAllowedFullTextSearchTypes(
    types: FullTextSearchTypeDefinition[],
    permissions: Array<Pick<FullTextSearchPermission, "permission">>,
): FullTextSearchTypeDefinition[] {
    const grantedPermissions = new Set(permissions.map(({ permission }) => permission));
    return types.filter(({ requiredPermission }) => requiredPermission.some((permission) => grantedPermissions.has(permission)));
}
