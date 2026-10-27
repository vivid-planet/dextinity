import { type DatabaseDialect, portableColumns } from "../../core/server/index.js";
import type { ContentScope } from "../common/permissions.evaluation.js";

/**
 * The tables of the permission model:
 *
 * - `UserPermission`: a permission granted to a user in content scopes, with validity and the reason for the grant
 * - `Role`: a bundle of permissions
 * - `UserRole`, `GroupRole`: a role assigned to a user or to an identity provider group (from Cloudflare Access) in content scopes
 */
export function createPermissionsSchema(dialect: DatabaseDialect) {
    const column = portableColumns(dialect);

    const timestamps = () => ({
        createdAt: column
            .timestamp()
            .notNull()
            .$defaultFn(() => new Date()),
        updatedAt: column
            .timestamp()
            .notNull()
            .$defaultFn(() => new Date())
            .$onUpdateFn(() => new Date()),
    });

    const userPermissions = column.table(
        "UserPermission",
        {
            id: column
                .uuid()
                .primaryKey()
                .$defaultFn(() => crypto.randomUUID()),
            userId: column.text().notNull(),
            permission: column.text().notNull(),
            contentScopes: column.json<ContentScope[]>().notNull(),
            validFrom: column.timestamp(),
            validTo: column.timestamp(),
            reason: column.text(),
            requestedBy: column.text(),
            approvedBy: column.text(),
            ...timestamps(),
        },
        (table) => [column.index("UserPermission_userId_index").on(table.userId)],
    );

    const roles = column.table("Role", {
        id: column.text().primaryKey(),
        name: column.text().notNull(),
        permissions: column.json<string[]>().notNull(),
        ...timestamps(),
    });

    const userRoles = column.table(
        "UserRole",
        {
            id: column
                .uuid()
                .primaryKey()
                .$defaultFn(() => crypto.randomUUID()),
            userId: column.text().notNull(),
            roleId: column
                .text()
                .notNull()
                .references(() => roles.id, { onDelete: "cascade" }),
            contentScopes: column.json<ContentScope[]>().notNull(),
            ...timestamps(),
        },
        (table) => [column.index("UserRole_userId_index").on(table.userId)],
    );

    const groupRoles = column.table(
        "GroupRole",
        {
            id: column
                .uuid()
                .primaryKey()
                .$defaultFn(() => crypto.randomUUID()),
            group: column.text().notNull(),
            roleId: column
                .text()
                .notNull()
                .references(() => roles.id, { onDelete: "cascade" }),
            contentScopes: column.json<ContentScope[]>().notNull(),
            ...timestamps(),
        },
        (table) => [column.index("GroupRole_group_index").on(table.group)],
    );

    return { userPermissions, roles, userRoles, groupRoles };
}

export type PermissionsSchema = ReturnType<typeof createPermissionsSchema>;
