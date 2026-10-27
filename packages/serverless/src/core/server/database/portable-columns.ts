import {
    bigint,
    boolean,
    doublePrecision,
    index as pgIndex,
    integer as pgInteger,
    jsonb,
    pgTable,
    text as pgText,
    timestamp,
    uniqueIndex as pgUniqueIndex,
    uuid,
} from "drizzle-orm/pg-core";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export type DatabaseDialect = "sqlite" | "postgresql";

const sqliteColumns = {
    table: sqliteTable,
    index,
    uniqueIndex,
    uuid: () => text(),
    text: () => text(),
    textEnum: <TValues extends readonly [string, ...string[]]>(values: TValues) => text({ enum: values as unknown as [TValues[number]] }),
    boolean: () => integer({ mode: "boolean" }),
    integer: () => integer(),
    bigInteger: () => integer(),
    double: () => real(),
    timestamp: () => integer({ mode: "timestamp_ms" }),
    json: <TData>() => text({ mode: "json" }).$type<TData>(),
};

export type PortableColumns = typeof sqliteColumns;

// Typed like the SQLite columns: the column builders of both dialects share the methods used in schemas (notNull, default, references, …)
// and map to the same JavaScript types.
const postgresqlColumns = {
    table: pgTable,
    index: pgIndex,
    uniqueIndex: pgUniqueIndex,
    uuid: () => uuid(),
    text: () => pgText(),
    textEnum: <TValues extends readonly [string, ...string[]]>(values: TValues) => pgText({ enum: values as unknown as [TValues[number]] }),
    boolean: () => boolean(),
    integer: () => pgInteger(),
    bigInteger: () => bigint({ mode: "number" }),
    double: () => doublePrecision(),
    timestamp: () => timestamp({ withTimezone: true }),
    json: <TData>() => jsonb().$type<TData>(),
} as unknown as PortableColumns;

/**
 * Column builders for schemas that run on D1 and PostgreSQL. A feature defines its tables once with these, and gets SQLite tables or
 * PostgreSQL tables depending on the dialect. Both are typed as SQLite tables, so services are written once against one type.
 */
export function portableColumns(dialect: DatabaseDialect): PortableColumns {
    return dialect === "postgresql" ? postgresqlColumns : sqliteColumns;
}
