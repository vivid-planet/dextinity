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
import { FullTextSnippetService } from "./full-text-snippet.service.js";

const rows = [
    { id: "main-page", type: "Page", text: "contact", requiredPermission: ["pageTree"], scopes: [{ domain: "main", language: "en" }] },
    { id: "secondary-page", type: "Page", text: "contact", requiredPermission: ["pageTree"], scopes: [{ domain: "secondary", language: "en" }] },
    { id: "product", type: "Product", text: "contact", requiredPermission: ["products"], scopes: null },
    { id: "Media", type: "Product", text: "Video blocks, image blocks and more blocks", requiredPermission: ["products"], scopes: null },
    { id: "Video", type: "Product", text: "Play blocks", requiredPermission: ["products"], scopes: null },
    { id: "Video blocks guide", type: "Product", text: "How to", requiredPermission: ["products"], scopes: null },
    { id: "Video blocks", type: "Product", text: "Overview", requiredPermission: ["products"], scopes: null },
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
            CREATE TABLE "EntityInfoFullText" ("id" text, "entityName" text, "type" text, "fullText" tsvector, "requiredPermission" text[], "scopes" jsonb);
            CREATE TABLE "EntityInfo" ("id" text, "entityName" text, "name" text, "secondaryInformation" text, "visible" boolean, "requiredPermission" text[]);
        `);
        for (const { id, type, text, requiredPermission, scopes } of rows) {
            await database.query(`INSERT INTO "EntityInfoFullText" VALUES ($1, 'Entity', $2, to_tsvector('simple', $1 || ' ' || $3), $4, $5)`, [
                id,
                type,
                text,
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
        resolver = new FullTextSearchResolver(orm.em, new AccessControlService(), new FullTextSnippetService(orm.em));
    }, 30000);

    afterAll(async () => {
        await orm.close();
        await database.close();
    });

    function search(search: string, scope?: ContentScope, types?: string[]) {
        return resolver.myFullTextSearch({ search, scope, types, offset: 0, limit: 25 }, user, { previewDamUrls: false });
    }

    async function findIds(scope?: ContentScope) {
        const result = await search("contact", scope);
        return result.nodes.map(({ id }) => id).sort();
    }

    it("doesn't find entities of a scope the user has no permission for", async () => {
        expect(await findIds({ domain: "secondary", language: "en" })).toEqual(["product"]);
    });

    it("finds entities of a scope the user has the permission for", async () => {
        expect(await findIds({ domain: "main", language: "en" })).toEqual(["main-page", "product"]);
    });

    it("counts the results per type, with the permissions of all scopes when searching without a scope", async () => {
        const result = await search("contact");

        expect(result.types).toEqual([
            { type: "Page", count: 2 },
            { type: "Product", count: 1 },
        ]);
        expect(result.totalCount).toBe(3);
    });

    it("returns only results of the given types, but counts the results of all types", async () => {
        const result = await search("contact", undefined, ["Product"]);

        expect(result.nodes.map(({ id }) => id)).toEqual(["product"]);
        expect(result.totalCount).toBe(1);
        expect(result.types).toEqual([
            { type: "Page", count: 2 },
            { type: "Product", count: 1 },
        ]);
    });

    it("orders by exact name, all terms in the name, some terms in the name, then content matches", async () => {
        const result = await search("video blocks");

        expect(result.nodes.map(({ name }) => name)).toEqual(["Video blocks", "Video blocks guide", "Video", "Media"]);
    });

    it("marks any of the terms in the names", async () => {
        const result = await search("video blocks");

        expect(result.nodes.map(({ name, titleHighlights }) => titleHighlights.map(({ start, end }) => name.slice(start, end)))).toEqual([
            ["Video", "blocks"],
            ["Video", "blocks"],
            ["Video"],
            [],
        ]);
    });
});
