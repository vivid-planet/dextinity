import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PREFIX_TSQUERY_SQL } from "./prefix-full-text-query";

const documents = [
    { name: "Navigation", text: "Main menu of the site" },
    { name: "Fixtures: Blocks", text: "Text and media blocks" },
    { name: "Visit foo-bar", text: "Read more on https://example.com/a-b" },
    { name: "Größe", text: "Size chart" },
];

// Runs the condition in PostgreSQL (compiled to WebAssembly), because only the database shows how it parses the search
describe("PREFIX_TSQUERY_SQL", () => {
    let database: PGlite;

    beforeAll(async () => {
        database = new PGlite();
        await database.exec(`CREATE TABLE "Document" ("name" text, "fullText" tsvector)`);
        for (const { name, text } of documents) {
            await database.query(`INSERT INTO "Document" VALUES ($1, to_tsvector('simple', $1 || ' ' || $2))`, [name, text]);
        }
    }, 30000);

    afterAll(async () => {
        await database.close();
    });

    async function search(term: string) {
        const condition = `"fullText" @@ ${PREFIX_TSQUERY_SQL.replace("?", "$1")}`;
        const results = await database.query<{ name: string }>(`SELECT "name" FROM "Document" WHERE ${condition} ORDER BY "name"`, [term]);
        const counts = await database.query<{ count: number }>(`SELECT count(*)::int AS "count" FROM "Document" WHERE ${condition}`, [term]);
        return { names: results.rows.map((row) => row.name), count: counts.rows[0].count };
    }

    it("matches the last word as a prefix", async () => {
        expect(await search("Navig")).toEqual({ names: ["Navigation"], count: 1 });
        expect(await search("fixtures blo")).toEqual({ names: ["Fixtures: Blocks"], count: 1 });
    });

    it("matches only complete earlier words", async () => {
        expect(await search("fix blo")).toEqual({ names: [], count: 0 });
    });

    it("matches hyphenated words, URLs and letters outside of ASCII", async () => {
        expect(await search("foo-bar")).toEqual({ names: ["Visit foo-bar"], count: 1 });
        expect(await search("example.com/a-b")).toEqual({ names: ["Visit foo-bar"], count: 1 });
        expect(await search("größ")).toEqual({ names: ["Größe"], count: 1 });
    });

    it("keeps the lexemes of plainto_tsquery instead of parsing them again", async () => {
        const result = await database.query<{ query: string }>(`SELECT ${PREFIX_TSQUERY_SQL.replace("?", "$1")}::text AS "query"`, ["foo-bar"]);
        expect(result.rows[0].query).toBe("'foo-bar' & 'foo' & 'bar':*");
    });

    it("ignores tsquery operators in the search", async () => {
        expect(await search("navigation & | !menu:*")).toEqual({ names: ["Navigation"], count: 1 });
    });

    it("matches nothing when the search has no words", async () => {
        for (const term of ["", "   ", " &|! ", "'\\:*"]) {
            expect(await search(term)).toEqual({ names: [], count: 0 });
        }
    });
});
