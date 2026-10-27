import { type SQL, sql } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

/** Portable replacement for PostgreSQL's `ILIKE '%term%'`, which SQLite lacks. */
export function containsIgnoringCase(column: SQLiteColumn, term: string): SQL {
    const pattern = `%${term.toLowerCase().replace(/[\\%_]/g, (character) => `\\${character}`)}%`;
    return sql`lower(${column}) like ${pattern} escape '\\'`;
}
