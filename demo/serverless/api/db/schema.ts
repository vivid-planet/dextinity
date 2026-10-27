import { createDamSchema, createPageTreeSchema, createPermissionsSchema, type DatabaseDialect, ScopeColumns } from "@dextinity/serverless/server";

import { ContentScope } from "../../shared/content-scope";

/** The tables of all modules, for drizzle-kit. The modules create the same tables at runtime. */
export function createSchema(dialect: DatabaseDialect) {
    const scopeColumns = new ScopeColumns(Object.keys(ContentScope.shape));
    return {
        ...createDamSchema({ dialect, scopeColumns }),
        ...createPageTreeSchema({ dialect, scopeColumns }),
        ...createPermissionsSchema(dialect),
    };
}
