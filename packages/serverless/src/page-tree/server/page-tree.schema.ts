import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";

import { type DatabaseDialect, portableColumns, type ScopeColumns } from "../../core/server/index.js";

export const pageTreeNodeVisibilities = ["Published", "Unpublished", "Archived"] as const;

export type PageTreeNodeVisibility = (typeof pageTreeNodeVisibilities)[number];

/**
 * The counterpart of `PageTreeNodeBase`: one table for the nodes of all categories, with the columns of the application's scope.
 * Nodes reference their parent only, paths are calculated from the slugs. The documents of the nodes are stored as JSON.
 */
export function createPageTreeSchema({ dialect, scopeColumns }: { dialect: DatabaseDialect; scopeColumns: ScopeColumns }) {
    const column = portableColumns(dialect);

    const pageTreeNodes = column.table(
        "PageTreeNode",
        {
            id: column
                .uuid()
                .primaryKey()
                .$defaultFn(() => crypto.randomUUID()),
            parentId: column.uuid().references((): AnySQLiteColumn => pageTreeNodes.id, { onDelete: "cascade" }),
            pos: column.integer().notNull(),
            name: column.text().notNull(),
            slug: column.text().notNull(),
            visibility: column.textEnum(pageTreeNodeVisibilities).notNull().default("Unpublished"),
            documentType: column.text().notNull(),
            category: column.text().notNull(),
            hideInMenu: column.boolean().notNull().default(false),
            createdAt: column
                .timestamp()
                .notNull()
                .$defaultFn(() => new Date()),
            updatedAt: column
                .timestamp()
                .notNull()
                .$defaultFn(() => new Date())
                .$onUpdateFn(() => new Date()),
            ...scopeColumns.definitions(column),
        },
        (table) => [column.index("PageTreeNode_parentId_index").on(table.parentId)],
    );

    // One document per node and type: changing the type of a node keeps the document of the previous type, changing it back restores it
    const pageTreeDocuments = column.table(
        "PageTreeDocument",
        {
            id: column
                .uuid()
                .primaryKey()
                .$defaultFn(() => crypto.randomUUID()),
            pageTreeNodeId: column
                .uuid()
                .notNull()
                .references(() => pageTreeNodes.id, { onDelete: "cascade" }),
            type: column.text().notNull(),
            /** The input of each root block, e.g. `{ content: { blocks: […] }, seo: { … } }` */
            data: column.json<Record<string, unknown>>().notNull(),
            createdAt: column
                .timestamp()
                .notNull()
                .$defaultFn(() => new Date()),
            updatedAt: column
                .timestamp()
                .notNull()
                .$defaultFn(() => new Date()),
        },
        (table) => [column.uniqueIndex("PageTreeDocument_pageTreeNodeId_type_index").on(table.pageTreeNodeId, table.type)],
    );

    return { pageTreeNodes, pageTreeDocuments };
}

export type PageTreeSchema = ReturnType<typeof createPageTreeSchema>;
