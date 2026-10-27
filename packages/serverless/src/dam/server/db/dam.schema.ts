import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";

import { type ContentScope, type DatabaseDialect, portableColumns, type ScopeColumns } from "../../../core/server/index.js";
import { focalPoints } from "../common/focal-point.js";

export const licenseTypes = ["ROYALTY_FREE", "RIGHTS_MANAGED"] as const;
export const aiContentTypes = ["Generated", "Modified"] as const;

export type DamScope = ContentScope;

/**
 * The counterpart of `createFileEntity` and `createFolderEntity`: creates the DAM tables for the dialect, with the columns of the
 * application's scope. Folders reference their parent only, ancestors are queried recursively (no PostgreSQL arrays, which D1 lacks).
 *
 * The scope columns aren't part of the table types because they depend on the application. Use `ScopeColumns` to read and write them.
 */
export function createDamSchema({ dialect, scopeColumns }: { dialect: DatabaseDialect; scopeColumns: ScopeColumns }) {
    const column = portableColumns(dialect);

    const id = () =>
        column
            .uuid()
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID());
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

    const damFileImages = column.table("DamFileImage", {
        id: id(),
        width: column.integer().notNull(),
        height: column.integer().notNull(),
        exif: column.json<Record<string, unknown>>(),
        dominantColor: column.text(),
        cropAreaFocalPoint: column.textEnum(focalPoints).notNull(),
        cropAreaWidth: column.double(),
        cropAreaHeight: column.double(),
        cropAreaX: column.double(),
        cropAreaY: column.double(),
    });

    const damFolders = column.table(
        "DamFolder",
        {
            id: id(),
            name: column.text().notNull(),
            parentId: column.uuid().references((): AnySQLiteColumn => damFolders.id, { onDelete: "cascade", onUpdate: "cascade" }),
            archived: column.boolean().notNull().default(false),
            isInboxFromOtherScope: column.boolean().notNull().default(false),
            ...timestamps(),
            ...scopeColumns.definitions(column),
        },
        (table) => [column.index("DamFolder_parentId_index").on(table.parentId)],
    );

    const damFiles = column.table(
        "DamFile",
        {
            id: id(),
            folderId: column.uuid().references(() => damFolders.id, { onDelete: "set null", onUpdate: "cascade" }),
            name: column.text().notNull(),
            size: column.bigInteger().notNull(),
            mimetype: column.text().notNull(),
            contentHash: column.text().notNull(),
            title: column.text(),
            altText: column.text(),
            archived: column.boolean().notNull().default(false),
            imageId: column
                .uuid()
                .unique("DamFile_imageId_unique")
                .references(() => damFileImages.id, { onDelete: "cascade", onUpdate: "cascade" }),
            licenseType: column.textEnum(licenseTypes),
            licenseDetails: column.text(),
            licenseAuthor: column.text(),
            licenseDurationFrom: column.timestamp(),
            licenseDurationTo: column.timestamp(),
            importSourceId: column.text(),
            importSourceType: column.text(),
            copyOfId: column.uuid().references((): AnySQLiteColumn => damFiles.id, { onDelete: "set null", onUpdate: "cascade" }),
            aiContentType: column.textEnum(aiContentTypes),
            ...timestamps(),
            ...scopeColumns.definitions(column),
        },
        (table) => [column.index("DamFile_contentHash_index").on(table.contentHash), column.index("DamFile_folderId_index").on(table.folderId)],
    );

    return { damFiles, damFolders, damFileImages };
}

export type DamSchema = ReturnType<typeof createDamSchema>;
