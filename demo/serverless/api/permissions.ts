import type { AccessIdentity, ContentScope, PermissionGrant } from "@dextinity/serverless/server";

const availablePermissions = ["dam", "pageTree"];

export const contentScopes: ContentScope[] = [{ domain: "main" }, { domain: "secondary" }];

/** Members of the admins group in the identity provider get all permissions. Other grants are stored, see the seed in scripts/database.ts. */
export function permissionRules(identity: AccessIdentity): PermissionGrant[] {
    if (identity.groups.includes("admins")) {
        return availablePermissions.map((permission) => ({ permission, contentScopes: [{ domain: "*" }] }));
    }
    return [];
}
