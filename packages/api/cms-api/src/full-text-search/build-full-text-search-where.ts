import type { ContentScope } from "../user-permissions/interfaces/content-scope.interface";
import { ALL_TERMS_TSQUERY_SQL } from "./full-text-query";

export interface FullTextSearchPermission {
    permission: string;
    contentScopes: ContentScope[];
}

export interface FullTextSearchWhereOptions {
    search: string;
    /**
     * A row is returned only if one of these permissions is a required permission of its entity and, for scoped entities,
     * one of the entity's scopes is within the permission's content scopes (see `isScopeWithin`).
     * Pass the permissions of the current user, e.g. `user.permissions`.
     */
    permissions: FullTextSearchPermission[];
    includeInvisible: boolean;
    /**
     * Narrows the results to this scope. Unscoped entities are part of every scope. This is not an access check.
     */
    scope?: ContentScope;
    types?: string[];
}

// Mirrors isScopeWithin(entityScope, permissionScope): every dimension of the entity scope equals the dimension of the
// permission scope, or the permission scope holds the wildcard "*". A missing dimension equals null. Scopes that aren't
// objects never match. COALESCE keeps SQL NULL out of the comparison, which would otherwise count as a match.
const allowedRowSql = `EXISTS (
    SELECT 1 FROM jsonb_to_recordset(?::jsonb) AS p("permission" text, "contentScopes" jsonb)
    WHERE p."permission" = ANY(f."requiredPermission")
    AND (
        f."scopes" IS NULL
        OR EXISTS (
            SELECT 1
            FROM jsonb_array_elements(f."scopes") AS entity_scope(value), jsonb_array_elements(p."contentScopes") AS permission_scope(value)
            WHERE CASE
                WHEN jsonb_typeof(entity_scope.value) = 'object' AND jsonb_typeof(permission_scope.value) = 'object' THEN NOT EXISTS (
                    SELECT 1
                    FROM jsonb_each(entity_scope.value) AS dimension(key, value),
                        COALESCE(permission_scope.value -> dimension.key, 'null'::jsonb) AS permission_dimension(value)
                    WHERE permission_dimension.value <> '"*"'::jsonb AND permission_dimension.value <> dimension.value
                )
                ELSE false
            END
        )
    )
)`;

/**
 * Builds the WHERE clause for the "EntityInfoFullText" view (alias `f`) joined with the "EntityInfo" view (alias `e`).
 * All user input is returned as bindings, never as part of the SQL.
 */
export function buildFullTextSearchWhere({ search, permissions, includeInvisible, scope, types }: FullTextSearchWhereOptions): {
    sql: string;
    bindings: unknown[];
} {
    // Optional conditions are added here instead of as "? IS NULL OR …", so the planner can drop them.
    const conditions = [`f."fullText" @@ ${ALL_TERMS_TSQUERY_SQL}`, allowedRowSql];
    const bindings: unknown[] = [search, JSON.stringify(permissions.map(({ permission, contentScopes }) => ({ permission, contentScopes })))];

    if (!includeInvisible) {
        conditions.push(`e."visible" = true`);
    }

    if (scope) {
        conditions.push(`(f."scopes" IS NULL OR f."scopes" @> ?::jsonb)`);
        // GraphQL sends the scope with a null prototype, spreading creates a plain object.
        bindings.push(JSON.stringify([{ ...scope }]));
    }

    if (types && types.length > 0) {
        conditions.push(`f."type" = ANY(ARRAY[?]::text[])`);
        bindings.push(types);
    }

    return { sql: conditions.join(" AND "), bindings };
}
