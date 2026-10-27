import { and, eq, type SQL } from "drizzle-orm";
import type { SQLiteColumn, SQLiteTable } from "drizzle-orm/sqlite-core";

import type { PortableColumns } from "../database/portable-columns.js";

/** A value per scope dimension, e.g. `{ domain: "main", language: "de" }` */
export type ContentScope = Record<string, string>;

const scopeColumnName = (dimension: string) => `scope_${dimension}`;

/**
 * The columns of an application-defined scope on a feature's table, one `scope_<dimension>` column per dimension. They aren't part of the
 * table types because they depend on the application: define them with `definitions()` and read and write them with the other methods.
 */
export class ScopeColumns {
    constructor(readonly dimensions: readonly string[]) {}

    get hasScope(): boolean {
        return this.dimensions.length > 0;
    }

    /** Spread into a table definition. Typed as empty, the columns exist at runtime only. */
    definitions(column: PortableColumns): Record<never, never> {
        return Object.fromEntries(this.dimensions.map((dimension) => [scopeColumnName(dimension), column.text().notNull()]));
    }

    /** Use as `.where(scopeColumns.equals(table, scope))`. Without a scope, matches all rows. */
    equals(table: SQLiteTable, scope: ContentScope | undefined): SQL | undefined {
        if (scope === undefined) {
            return undefined;
        }
        return and(...this.dimensions.map((dimension) => eq(this.column(table, dimension), scope[dimension])));
    }

    toValues(scope: ContentScope | undefined): Record<string, string> {
        return Object.fromEntries(this.dimensions.map((dimension) => [scopeColumnName(dimension), scope?.[dimension] as string]));
    }

    fromRow(row: object): ContentScope {
        return Object.fromEntries(this.dimensions.map((dimension) => [dimension, (row as Record<string, string>)[scopeColumnName(dimension)]]));
    }

    select(table: SQLiteTable): Record<string, SQLiteColumn> {
        return Object.fromEntries(this.dimensions.map((dimension) => [scopeColumnName(dimension), this.column(table, dimension)]));
    }

    /** The column of each dimension, e.g. for `scopeFilter()` of the permissions module */
    byDimension(table: SQLiteTable): Record<string, SQLiteColumn> {
        return Object.fromEntries(this.dimensions.map((dimension) => [dimension, this.column(table, dimension)]));
    }

    private column(table: SQLiteTable, dimension: string): SQLiteColumn {
        return (table as unknown as Record<string, SQLiteColumn>)[scopeColumnName(dimension)];
    }
}

export function scopesAreEqual(scope: ContentScope | undefined, otherScope: ContentScope | undefined): boolean {
    const dimensions = new Set([...Object.keys(scope ?? {}), ...Object.keys(otherScope ?? {})]);
    return [...dimensions].every((dimension) => scope?.[dimension] === otherScope?.[dimension]);
}
