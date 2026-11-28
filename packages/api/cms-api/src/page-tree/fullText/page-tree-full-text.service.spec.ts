import { PGlite } from "@electric-sql/pglite";
import type { EntityManager, EntityMetadata } from "@mikro-orm/postgresql";
import type { Type } from "@nestjs/common";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { DocumentInterface } from "../../document/dto/document-interface";
import { ALL_TERMS_TSQUERY_SQL } from "../../full-text-search/full-text-query";
import { PageTreeFullTextService } from "./page-tree-full-text.service";

class Page {}
class PredefinedPage {}

const documentMetadata: Record<string, EntityMetadata> = {
    Page: {
        name: "Page",
        tableName: "Page",
        primaryKeys: ["id"],
        props: [
            { name: "id", columnTypes: ["text"], fieldNames: ["id"] },
            { name: "fullTextContent", columnTypes: ["tsvector"], fieldNames: ["fullTextContent"] },
            { name: "fullTextSeo", columnTypes: ["tsvector"], fieldNames: ["fullTextSeo"] },
        ],
    } as unknown as EntityMetadata,
    PredefinedPage: {
        name: "PredefinedPage",
        tableName: "PredefinedPage",
        primaryKeys: ["id"],
        props: [
            { name: "id", columnTypes: ["text"], fieldNames: ["id"] },
            { name: "fullText", columnTypes: ["tsvector"], fieldNames: ["fullText"] },
        ],
    } as unknown as EntityMetadata,
};

// Runs the view in PostgreSQL (compiled to WebAssembly), because only the database shows which nodes its joins keep
describe("PageTreeFullTextService", () => {
    let database: PGlite;

    beforeAll(async () => {
        database = new PGlite();
        await database.exec(`
            CREATE TABLE "PageTreeNode" ("id" text PRIMARY KEY, "name" text, "slug" text, "documentType" text, "fullText" tsvector NULL);
            CREATE TABLE "PageTreeNodeDocument" ("pageTreeNodeId" text, "documentId" text, "type" text);
            CREATE TABLE "Page" ("id" text PRIMARY KEY, "fullTextContent" tsvector, "fullTextSeo" tsvector NULL);
            CREATE TABLE "PredefinedPage" ("id" text PRIMARY KEY, "fullText" tsvector);

            INSERT INTO "PageTreeNode" VALUES
                ('about', 'About us', 'about-us', 'Page', setweight(to_tsvector('simple', 'About us'), 'A') || setweight(to_tsvector('simple', 'about-us'), 'D')),
                ('legacy', 'Archive', 'old-records', 'Page', NULL),
                ('contact', 'Contact form', 'contact-form', 'Link', setweight(to_tsvector('simple', 'Contact form'), 'A') || setweight(to_tsvector('simple', 'contact-form'), 'D')),
                ('external', 'Partner site', 'partner-site', 'Link', setweight(to_tsvector('simple', 'Partner site'), 'A') || setweight(to_tsvector('simple', 'partner-site'), 'D')),
                ('news', 'Newsroom', 'newsroom', 'Page', setweight(to_tsvector('simple', 'Press'), 'A') || setweight(to_tsvector('simple', 'press'), 'D')),
                ('team', 'Team', 'team', 'Page', setweight(to_tsvector('simple', 'Team'), 'A') || setweight(to_tsvector('simple', 'team'), 'D'));

            INSERT INTO "Page" VALUES
                ('about-page', to_tsvector('simple', 'Company history'), to_tsvector('simple', 'Founded long ago')),
                ('legacy-page', to_tsvector('simple', 'Former projects'), NULL),
                ('team-page', to_tsvector('simple', 'Our employees'), NULL),
                ('news-page', to_tsvector('simple', 'Latest announcements'), NULL),
                ('unrelated-page', to_tsvector('simple', 'Confidential notes'), NULL);

            INSERT INTO "PredefinedPage" VALUES
                ('about-page', to_tsvector('simple', 'Imprint'));

            INSERT INTO "PageTreeNodeDocument" VALUES
                ('about', 'about-page', 'Page'),
                ('legacy', 'legacy-page', 'Page'),
                ('team', 'team-page', 'Page'),
                ('team', 'unrelated-page', 'Link'),
                ('news', 'news-page', 'Page'),
                ('contact', 'contact-link', 'Link');
        `);

        const entityManager = {
            getMetadata: () => ({ get: (name: string) => documentMetadata[name] }),
            getConnection: () => ({ execute: (sql: string) => database.exec(sql) }),
        } as unknown as EntityManager;

        await new PageTreeFullTextService(
            [Page as Type<DocumentInterface>, PredefinedPage as Type<DocumentInterface>],
            entityManager,
        ).createPageTreeFullTextView();
    }, 30000);

    afterAll(async () => {
        await database.close();
    });

    async function search(term: string) {
        const result = await database.query<{ pageTreeNodeId: string }>(
            `SELECT "pageTreeNodeId" FROM "PageTreeNodeFullText" WHERE "fullText" @@ ${ALL_TERMS_TSQUERY_SQL.replace("?", "$1")} ORDER BY "pageTreeNodeId"`,
            [term],
        );
        return result.rows.map((row) => row.pageTreeNodeId);
    }

    async function matchesQuery(pageTreeNodeId: string, tsquery: string) {
        const result = await database.query<{ matches: boolean }>(
            `SELECT "fullText" @@ to_tsquery('simple', $2) AS "matches" FROM "PageTreeNodeFullText" WHERE "pageTreeNodeId" = $1`,
            [pageTreeNodeId, tsquery],
        );
        return result.rows[0].matches;
    }

    it("finds a node without a stored full text by its name and slug", async () => {
        expect(await search("Archive")).toEqual(["legacy"]);
        expect(await search("old-records")).toEqual(["legacy"]);
    });

    it("weights the name higher than the slug for a node without a stored full text", async () => {
        expect(await matchesQuery("legacy", "archive:A")).toBe(true);
        expect(await matchesQuery("legacy", "archive:D")).toBe(false);
        expect(await matchesQuery("legacy", "records:D")).toBe(true);
        expect(await matchesQuery("legacy", "records:A")).toBe(false);
    });

    it("uses the stored full text instead of the name and slug when it is set", async () => {
        expect(await search("Press")).toEqual(["news"]);
        expect(await search("Newsroom")).toEqual([]);
    });

    it("keeps nodes without an indexed document", async () => {
        const result = await database.query<{ pageTreeNodeId: string }>(
            `SELECT "pageTreeNodeId" FROM "PageTreeNodeFullText" ORDER BY "pageTreeNodeId"`,
        );
        expect(result.rows.map((row) => row.pageTreeNodeId)).toEqual(["about", "contact", "external", "legacy", "news", "team"]);
        expect(await search("Contact")).toEqual(["contact"]);
        expect(await search("Partner")).toEqual(["external"]);
    });

    it("finds a node by its document text and by its name", async () => {
        expect(await search("history")).toEqual(["about"]);
        expect(await search("Founded")).toEqual(["about"]);
        expect(await search("About")).toEqual(["about"]);
        expect(await search("projects")).toEqual(["legacy"]);
    });

    it("ignores documents of another type that share the document id", async () => {
        expect(await search("Imprint")).toEqual([]);
    });

    it("ignores documents attached with a type other than the node's document type", async () => {
        expect(await search("employees")).toEqual(["team"]);
        expect(await search("Confidential")).toEqual([]);
    });
});
