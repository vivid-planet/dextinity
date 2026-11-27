import { PGlite } from "@electric-sql/pglite";
import { PostgreSqlPlatform } from "@mikro-orm/postgresql";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { markedTextsQuery, parseMarkedText, stripControlCharacters, toSnippet } from "./full-text-highlights.js";

function marked(text: string): string {
    return text.replaceAll("[", "\u0002").replaceAll("]", "\u0003");
}

describe("parseMarkedText", () => {
    it("returns the highlights as UTF-16 offsets", () => {
        const { text, highlights } = parseMarkedText(marked("🦊 [quick] brown [fox]"));

        expect(text).toBe("🦊 quick brown fox");
        expect(highlights.map(({ start, end }) => text.slice(start, end))).toEqual(["quick", "fox"]);
    });

    it("merges adjacent highlights and drops stray markers", () => {
        expect(parseMarkedText(marked("[ab][cd] e]f ["))).toEqual({ text: "abcd ef ", highlights: [{ start: 0, end: 4 }] });
    });
});

describe("toSnippet", () => {
    it("tells whether words were cut off before or after the fragment and keeps the punctuation after it", () => {
        expect(toSnippet(marked("please [contact] us"), "Questions? Please, please contact us!) Thanks")).toEqual({
            text: "please contact us!)",
            highlights: [{ start: 7, end: 14 }],
            truncatedStart: true,
            truncatedEnd: true,
        });
        expect(toSnippet(marked("please [contact] us"), " please contact us ")).toMatchObject({ truncatedStart: false, truncatedEnd: false });
    });

    it("returns no snippet without highlights", () => {
        expect(toSnippet("please contact us", "please contact us")).toBeUndefined();
    });
});

// Runs the query in PostgreSQL (compiled to WebAssembly), because only the database shows what ts_headline returns
describe("markedTextsQuery", () => {
    let database: PGlite;

    async function queryMarkedTexts(search: string, names: string[], texts: string[]) {
        const { sql, params } = markedTextsQuery({ search, names, texts });
        const result = await database.query<{ markedName: string; markedText: string }>(new PostgreSqlPlatform().formatQuery(sql, params));
        return result.rows;
    }

    beforeAll(async () => {
        database = new PGlite();
    }, 30000);

    afterAll(async () => {
        await database.close();
    });

    it("marks any of the terms in each name and in the best matching fragment of each text", async () => {
        const filler = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.";
        const names = ["Video guide", stripControlCharacters(marked("[Fake] video"))];
        const texts = [`${filler} Play the video blocks guide. ${filler}`, "Nothing to see"];

        const rows = await queryMarkedTexts("video blo", names, texts);

        const nameHighlights = rows.map((row, index) =>
            parseMarkedText(row.markedName).highlights.map(({ start, end }) => names[index].slice(start, end)),
        );
        expect(nameHighlights).toEqual([["Video"], ["video"]]);
        const snippet = toSnippet(rows[0].markedText, texts[0]);
        expect(snippet).toMatchObject({ truncatedStart: true, truncatedEnd: true });
        expect(snippet?.highlights.map(({ start, end }) => snippet.text.slice(start, end))).toEqual(["video", "blocks"]);
        expect(toSnippet(rows[1].markedText, texts[1])).toBeUndefined();
    });

    it("keeps HTML tags of the text in the snippet", async () => {
        const text = "Intro <b>text</b> with the video & more <script>x</script> end";

        const [row] = await queryMarkedTexts("video", ["Name"], [text]);

        expect(toSnippet(row.markedText, text)).toMatchObject({
            text: expect.stringContaining("Intro <b>text</b> with the video"),
            truncatedEnd: true,
        });
    });
});
