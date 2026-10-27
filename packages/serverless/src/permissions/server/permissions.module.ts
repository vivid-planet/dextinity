import { and, eq, gte, inArray, isNull, lte, or } from "drizzle-orm";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";

import { type AccessIdentity, type AccessVariables, type Database, type DatabaseDialect, inject, unauthorized } from "../../core/server/index.js";
import { can, type ContentScope, type PermissionGrant } from "../common/permissions.evaluation.js";
import { createPermissionsSchema, type PermissionsSchema } from "./permissions.schema.js";

export interface CurrentUser extends AccessIdentity {
    grants: PermissionGrant[];
}

export interface PermissionsVariables {
    /** `null` for requests without an identity */
    currentUser: CurrentUser | null;
}

export type PermissionsEnv = { Variables: AccessVariables & PermissionsVariables & { database: Database } };

interface PermissionsModuleOptions {
    dialect: DatabaseDialect;
    /** The content scopes of the application. The admin offers the ones the user has permissions in. */
    contentScopes: ContentScope[];
    /**
     * Grants by rule in project code, the counterpart of `getPermissionsForUser` and `getContentScopesForUser`. Rules aren't stored, so
     * they apply as long as the identity matches, e.g. all permissions for members of an admin group.
     */
    rules?: (identity: AccessIdentity) => PermissionGrant[];
}

/**
 * Dextinity's permission model as a module:
 *
 * - `schema`: the Drizzle tables of grants, roles and role assignments
 * - `provider`: middleware that loads the grants of the request's identity and provides `c.var.currentUser`. Register it for all
 *   routes with `app.use(permissions.provider)`, the other modules check their permissions with it.
 * - `routes`: `GET /me` with the current user, its grants and content scopes, mount with `app.route("/", permissions.routes)`
 *
 * Requires `identity` (from `cloudflareAccess()`) and `database` in the request context. Check permissions with `requirePermission()`,
 * `assertCan()` and `scopeFilter()`.
 */
export function createPermissionsModule({ dialect, contentScopes, rules = () => [] }: PermissionsModuleOptions) {
    const schema = createPermissionsSchema(dialect);

    const provider = createMiddleware<PermissionsEnv>(async (c, next) => {
        const identity = inject<AccessIdentity | null>(c, "identity", "PermissionsModule");
        const database = inject<Database>(c, "database", "PermissionsModule");
        c.set(
            "currentUser",
            identity && { ...identity, grants: mergeGrants([...rules(identity), ...(await loadGrants(database, schema, identity))]) },
        );
        await next();
    });

    const routes = new Hono<PermissionsEnv>().get("/me", (c) => {
        const { currentUser } = c.var;
        if (!currentUser) {
            throw unauthorized();
        }
        return c.json({
            ...currentUser,
            contentScopes: contentScopes.filter((scope) => currentUser.grants.some(({ permission }) => can(currentUser.grants, permission, scope))),
        });
    });

    return { schema, provider, routes };
}

export type PermissionsModule = ReturnType<typeof createPermissionsModule>;

/** The route types, for typed clients: `hc<PermissionsRoutes>(apiUrl)` */
export type PermissionsRoutes = PermissionsModule["routes"];

async function loadGrants(database: Database, schema: PermissionsSchema, identity: AccessIdentity): Promise<PermissionGrant[]> {
    const { userPermissions, roles, userRoles, groupRoles } = schema;
    const db = database.drizzle;
    const now = new Date();

    const [userGrants, userRoleGrants, groupRoleGrants] = await Promise.all([
        db
            .select({ permission: userPermissions.permission, contentScopes: userPermissions.contentScopes })
            .from(userPermissions)
            .where(
                and(
                    eq(userPermissions.userId, identity.id),
                    or(isNull(userPermissions.validFrom), lte(userPermissions.validFrom, now)),
                    or(isNull(userPermissions.validTo), gte(userPermissions.validTo, now)),
                ),
            ),
        db
            .select({ permissions: roles.permissions, contentScopes: userRoles.contentScopes })
            .from(userRoles)
            .innerJoin(roles, eq(userRoles.roleId, roles.id))
            .where(eq(userRoles.userId, identity.id)),
        identity.groups.length > 0
            ? db
                  .select({ permissions: roles.permissions, contentScopes: groupRoles.contentScopes })
                  .from(groupRoles)
                  .innerJoin(roles, eq(groupRoles.roleId, roles.id))
                  .where(inArray(groupRoles.group, identity.groups))
            : [],
    ]);

    const roleGrants = [...userRoleGrants, ...groupRoleGrants].flatMap(({ permissions, contentScopes }) =>
        permissions.map((permission) => ({ permission, contentScopes })),
    );
    return [...userGrants, ...roleGrants];
}

function mergeGrants(grants: PermissionGrant[]): PermissionGrant[] {
    const scopesByPermission = new Map<string, ContentScope[]>();
    for (const { permission, contentScopes } of grants) {
        scopesByPermission.set(permission, [...(scopesByPermission.get(permission) ?? []), ...contentScopes]);
    }
    return [...scopesByPermission].map(([permission, contentScopes]) => ({ permission, contentScopes }));
}
