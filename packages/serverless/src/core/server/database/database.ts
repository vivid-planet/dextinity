import type { SQL } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import { type AnyD1Database, drizzle } from "drizzle-orm/d1";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

import type { DatabaseDialect } from "./portable-columns.js";

/**
 * A Drizzle database typed as SQLite, which is D1 or PostgreSQL at runtime. Only use what both dialects support: build queries with
 * `select`, `insert`, `update`, `delete` and `$count`, and await them. `.get()`, `.all()`, `.run()` and `.values()` only exist on SQLite.
 */
export type PortableDrizzle = BaseSQLiteDatabase<"async", unknown>;

export type BatchQuery = BatchItem<"sqlite">;

export interface Database {
    readonly dialect: DatabaseDialect;
    readonly drizzle: PortableDrizzle;
    /**
     * Runs the queries atomically: as a batch on D1, in a transaction on PostgreSQL. D1 has no interactive transactions, so the queries
     * can't depend on each other's results. Generate IDs in the application instead of reading them from an insert.
     */
    batch(build: (db: PortableDrizzle) => BatchQuery[]): Promise<void>;
    /** Runs a raw query, e.g. a recursive one, and returns its rows. */
    rows<TRow>(query: SQL): Promise<TRow[]>;
}

export function createD1Database(binding: AnyD1Database): Database {
    const db = drizzle(binding);
    return {
        dialect: "sqlite",
        drizzle: db,
        async batch(build) {
            const [first, ...rest] = build(db);
            if (first) {
                await db.batch([first, ...rest]);
            }
        },
        rows: (query) => db.all(query),
    };
}

/**
 * @param db A Drizzle database of any PostgreSQL driver, e.g. `drizzle(postgres(env.HYPERDRIVE.connectionString))`
 */
export function createPostgresqlDatabase(db: PgDatabase<PgQueryResultHKT>): Database {
    return {
        dialect: "postgresql",
        drizzle: db as unknown as PortableDrizzle,
        async batch(build) {
            await db.transaction(async (transaction) => {
                for (const query of build(transaction as unknown as PortableDrizzle)) {
                    await query;
                }
            });
        },
        async rows<TRow>(query: SQL) {
            const result = (await db.execute(query)) as unknown as TRow[] | { rows: TRow[] };
            // postgres.js returns the rows, node-postgres a result object
            return Array.isArray(result) ? result : result.rows;
        },
    };
}
