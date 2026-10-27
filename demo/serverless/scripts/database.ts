/**
 * Prepares the local databases: `node scripts/database.ts <sqlite|postgresql> <migrate|seed>`.
 * D1 is migrated with `wrangler d1 migrations apply` (`db:seed:d1` runs it first), PostgreSQL with Drizzle's migrator. Seeding PostgreSQL
 * migrates it first, the seed needs the tables.
 */
import {
    createD1Database,
    createPageTreeSchema,
    createPermissionsSchema,
    createPostgresqlDatabase,
    type Database,
    type DatabaseDialect,
    ScopeColumns,
} from "@dextinity/serverless/server";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { getPlatformProxy } from "wrangler";

import { ContentScope } from "../shared/content-scope.ts";

const [dialect, command] = process.argv.slice(2) as [DatabaseDialect, "migrate" | "seed"];

const { POSTGRESQL_HOST, POSTGRESQL_PORT, POSTGRESQL_USER, POSTGRESQL_PWD_DECODED, POSTGRESQL_DB } = process.env;
const postgresqlOptions = { host: POSTGRESQL_HOST, port: Number(POSTGRESQL_PORT), user: POSTGRESQL_USER, password: POSTGRESQL_PWD_DECODED };
/** A database of its own next to the one of the NestJS demo, whose tables have the same names */
const postgresqlDatabaseName = `${POSTGRESQL_DB}_serverless`;

/**
 * Grants and roles of the users of the Access emulator (see vite.config.mts), admins get all permissions by rule. Adds a home page per
 * domain if it doesn't exist yet.
 */
async function seed(database: Database): Promise<void> {
    const { roles, groupRoles, userRoles, userPermissions } = createPermissionsSchema(database.dialect);
    const scopeColumns = new ScopeColumns(Object.keys(ContentScope.shape));
    const { pageTreeNodes } = createPageTreeSchema({ dialect: database.dialect, scopeColumns });
    const homePages = [
        { id: "00000000-0000-4000-8000-000000000001", domain: "main" },
        { id: "00000000-0000-4000-8000-000000000002", domain: "secondary" },
    ];

    await database.batch((db) => [
        db.delete(groupRoles),
        db.delete(userRoles),
        db.delete(userPermissions),
        db.delete(roles),
        db.insert(roles).values({ id: "editor", name: "Editor", permissions: ["dam", "pageTree"] }),
        // Members of the editors group in the identity provider may edit the main domain
        db.insert(groupRoles).values({ group: "editors", roleId: "editor", contentScopes: [{ domain: "main" }] }),
        db.insert(userPermissions).values({ userId: "3", permission: "dam", contentScopes: [{ domain: "secondary" }], reason: "Demo grant" }),
        ...homePages.map(({ id, domain }) =>
            db
                .insert(pageTreeNodes)
                .values({
                    id,
                    parentId: null,
                    pos: 1,
                    name: "Home",
                    slug: "home",
                    visibility: "Published",
                    documentType: "Page",
                    category: "mainNavigation",
                    ...scopeColumns.toValues({ domain }),
                })
                .onConflictDoNothing(),
        ),
    ]);
}

if (dialect === "sqlite") {
    const { env, dispose } = await getPlatformProxy<{ DB: Parameters<typeof createD1Database>[0] }>();
    if (command === "seed") {
        await seed(createD1Database(env.DB));
    }
    await dispose();
} else {
    const server = postgres({ ...postgresqlOptions, database: POSTGRESQL_DB });
    const [{ exists }] = await server`select exists(select 1 from pg_database where datname = ${postgresqlDatabaseName})`;
    if (!exists) {
        await server.unsafe(`create database "${postgresqlDatabaseName}"`);
    }
    await server.end();

    const client = postgres({ ...postgresqlOptions, database: postgresqlDatabaseName, onnotice: () => {} });
    await migrate(drizzle(client), { migrationsFolder: "migrations/postgresql" });
    if (command === "seed") {
        await seed(createPostgresqlDatabase(drizzle(client)));
    }
    await client.end();
}
console.info(`${command} ${dialect}: done`);
