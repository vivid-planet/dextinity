import { PGlite } from "@electric-sql/pglite";
import { ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { defineConfig, EntityCaseNamingStrategy, MikroORM } from "@mikro-orm/postgresql";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { EntityInfoObject } from "../entity-info/entity-info.object.js";
import { AbstractAccessControlService } from "../user-permissions/access-control.service.js";
import type { CurrentUser } from "../user-permissions/dto/current-user.js";
import type { ContentScope } from "../user-permissions/interfaces/content-scope.interface.js";
import type { Permission } from "../user-permissions/user-permissions.types.js";
import { EntityInfoFullTextObject } from "./entities/entity-info-full-text.object.js";
import { FullTextSearchResolver } from "./full-text-search.resolver.js";

const rows = [
    { id: "main-page", requiredPermission: ["pageTree"], scopes: [{ domain: "main", language: "en" }] },
    { id: "secondary-page", requiredPermission: ["pageTree"], scopes: [{ domain: "secondary", language: "en" }] },
    { id: "product", requiredPermission: ["products"], scopes: null },
];

const user: CurrentUser = {
    id: "b26d86a7-32bb-4c84-ab9d-d167dddd40ff",
    name: "User",
    email: "user@example.com",
    permissions: [
        { permission: "fullTextSearch", contentScopes: [{ domain: "main", language: "en" }] },
        { permission: "pageTree", contentScopes: [{ domain: "main", language: "en" }] },
        { permission: "products" as Permission, contentScopes: [{ domain: "*", language: "*" }] },
    ],
};

class AccessControlService extends AbstractAccessControlService {}

describe("FullTextSearchResolver", () => {
    let database: PGlite;
    let orm: MikroORM;
    let resolver: FullTextSearchResolver;

    beforeAll(async () => {
        database = new PGlite();
        await database.exec(`
            CREATE TABLE "EntityInfoFullText" ("id" text, "entityName" text, "fullText" tsvector, "requiredPermission" text[], "scopes" jsonb);
            CREATE TABLE "EntityInfo" ("id" text, "entityName" text, "name" text, "secondaryInformation" text, "visible" boolean, "requiredPermission" text[]);
        `);
        for (const { id, requiredPermission, scopes } of rows) {
            await database.query(`INSERT INTO "EntityInfoFullText" VALUES ($1, 'Entity', to_tsvector('simple', 'contact'), $2, $3)`, [
                id,
                requiredPermission,
                scopes && JSON.stringify(scopes),
            ]);
            await database.query(`INSERT INTO "EntityInfo" VALUES ($1, 'Entity', $1, NULL, true, $2)`, [id, requiredPermission]);
        }

        orm = await MikroORM.init(
            defineConfig({
                metadataProvider: ReflectMetadataProvider,
                dbName: "test-db",
                allowGlobalContext: true,
                namingStrategy: EntityCaseNamingStrategy,
                entities: [EntityInfoFullTextObject, EntityInfoObject],
            }),
        );
        // Runs the queries built by MikroORM in PostgreSQL (compiled to WebAssembly)
        const connection = orm.em.getConnection();
        connection.execute = (async (sql: string, params: unknown[] = [], method: "all" | "get" | "run" = "all") => {
            const result = await database.query(connection.getPlatform().formatQuery(sql, params));
            return method === "get" ? result.rows[0] : result.rows;
        }) as typeof connection.execute;
        resolver = new FullTextSearchResolver(orm.em, new AccessControlService());
    }, 30000);

    afterAll(async () => {
        await orm.close();
        await database.close();
    });

    async function findIds(scope?: ContentScope) {
        const result = await resolver.myFullTextSearch("contact", 0, 25, user, { previewDamUrls: false }, scope);
        return result.nodes.map(({ id }: EntityInfoObject) => id).sort();
    }

    it("doesn't find entities of a scope the user has no permission for", async () => {
        expect(await findIds({ domain: "secondary", language: "en" })).toEqual(["product"]);
    });

    it("finds entities of a scope the user has the permission for", async () => {
        expect(await findIds({ domain: "main", language: "en" })).toEqual(["main-page", "product"]);
    });
});
