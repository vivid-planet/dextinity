import { describe, expect, it } from "vitest";

import { buildFullTextSearchWhere } from "./build-full-text-search-where";

const baseOptions = {
    search: "fox",
    permissions: [
        { permission: "pageTree", contentScopes: [{ domain: "main", language: "en" }] },
        { permission: "news", contentScopes: [{ domain: "main", language: "*" }] },
    ],
    includeInvisible: false,
};

describe("buildFullTextSearchWhere", () => {
    it("passes all user input as bindings", () => {
        const search = '\'; DROP TABLE "News"; --';
        const where = buildFullTextSearchWhere({
            search,
            permissions: [{ permission: "pageTree'; --", contentScopes: [{ domain: "main'; --" }] }],
            includeInvisible: false,
            scope: { domain: "main'; --" },
            types: ["Page'; --"],
        });

        expect(where.sql).not.toContain("'; ");
        expect(where.sql).not.toContain(";");
        expect(where.bindings).toEqual([
            search,
            JSON.stringify([{ permission: "pageTree'; --", contentScopes: [{ domain: "main'; --" }] }]),
            JSON.stringify([{ domain: "main'; --" }]),
            ["Page'; --"],
        ]);
        expect(where.sql.split("?").length - 1).toBe(where.bindings.length);
    });

    it("adds the types condition only for a non-empty list", () => {
        expect(buildFullTextSearchWhere(baseOptions).sql).not.toContain(`f."type"`);
        expect(buildFullTextSearchWhere({ ...baseOptions, types: [] }).sql).not.toContain(`f."type"`);
        expect(buildFullTextSearchWhere({ ...baseOptions, types: ["Page"] }).sql).toContain(`f."type" = ANY(ARRAY[?]::text[])`);
    });

    it("leaves out the visible condition when invisible entries are included", () => {
        expect(buildFullTextSearchWhere(baseOptions).sql).toContain(`e."visible" = true`);
        expect(buildFullTextSearchWhere({ ...baseOptions, includeInvisible: true }).sql).not.toContain(`e."visible"`);
    });

    it("passes only the permission and content scopes of each permission", () => {
        const where = buildFullTextSearchWhere({
            ...baseOptions,
            permissions: [Object.assign({ permission: "pageTree", contentScopes: [{ domain: "main" }] }, { extra: "ignored" })],
        });

        expect(where.bindings[1]).toBe(JSON.stringify([{ permission: "pageTree", contentScopes: [{ domain: "main" }] }]));
    });

    it("narrows to the given scope and keeps unscoped entities", () => {
        expect(buildFullTextSearchWhere(baseOptions).sql).not.toContain(`f."scopes" @>`);
        expect(buildFullTextSearchWhere({ ...baseOptions, scope: { domain: "main" } }).sql).toContain(
            `(f."scopes" IS NULL OR f."scopes" @> ?::jsonb)`,
        );
    });

    it("creates the same condition without types for the counts", () => {
        const withTypes = buildFullTextSearchWhere({ ...baseOptions, scope: { domain: "main" }, types: ["Page"] });
        const withoutTypes = buildFullTextSearchWhere({ ...baseOptions, scope: { domain: "main" } });

        expect(withTypes.sql).toBe(`${withoutTypes.sql} AND f."type" = ANY(ARRAY[?]::text[])`);
        expect(withTypes.bindings).toEqual([...withoutTypes.bindings, ["Page"]]);
    });
});
