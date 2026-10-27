import { and, eq, or, type SQL, sql } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import type { Context } from "hono";
import { createMiddleware } from "hono/factory";

import { forbidden, unauthorized } from "../../core/server/index.js";
import { anyScopeValue, can, type ContentScope } from "../common/permissions.evaluation.js";
import type { CurrentUser, PermissionsVariables } from "./permissions.module.js";

function currentUserOrFail(c: Context): CurrentUser {
    const currentUser: PermissionsVariables["currentUser"] | undefined = c.get("currentUser");
    if (currentUser === undefined) {
        throw new Error('Permission checks require "currentUser" in the request context. Register the provider of the permissions module.');
    }
    if (currentUser === null) {
        throw unauthorized();
    }
    return currentUser;
}

/**
 * The counterpart of `@RequiredPermission(..., { skipScopeCheck: true })`: requires the permission in any scope. Check the scope in the
 * handler with `assertCan()` once the scope of the affected entity is known (the counterpart of `@AffectedEntity`).
 */
export function requirePermission(permission: string) {
    return createMiddleware<{ Variables: PermissionsVariables }>(async (c, next) => {
        if (!can(currentUserOrFail(c).grants, permission)) {
            throw forbidden();
        }
        await next();
    });
}

export function assertCan(c: Context, permission: string, scope?: ContentScope): void {
    if (!can(currentUserOrFail(c).grants, permission, scope)) {
        throw forbidden();
    }
}

/**
 * A `where` condition matching the rows in the scopes the permission is granted in, the counterpart of `@ScopedEntity`. Fails closed:
 * without a grant, it matches no rows.
 *
 * @param columns The column of each scope dimension, e.g. `{ domain: table.scope_domain }`
 */
export function scopeFilter(c: Context, { permission, columns }: { permission: string; columns: Record<string, SQLiteColumn> }): SQL {
    const grantedScopes = currentUserOrFail(c)
        .grants.filter((grant) => grant.permission === permission)
        .flatMap((grant) => grant.contentScopes);

    const conditions = grantedScopes.map((scope) =>
        and(
            sql`1 = 1`,
            ...Object.entries(columns)
                .filter(([dimension]) => scope[dimension] !== anyScopeValue)
                .map(([dimension, column]) => (scope[dimension] === undefined ? sql`1 = 0` : eq(column, scope[dimension]))),
        ),
    );
    return or(sql`1 = 0`, ...conditions) as SQL;
}
