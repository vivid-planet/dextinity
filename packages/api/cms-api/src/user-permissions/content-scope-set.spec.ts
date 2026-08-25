import { describe, expect, it } from "vitest";

import { ContentScopeSet } from "./content-scope-set";

class DamScope {
    constructor(public domain: string) {}
}

describe("ContentScopeSet", () => {
    it("finds a scope regardless of the order its dimensions were written in", () => {
        const scopes = new ContentScopeSet([{ domain: "main", language: "en" }]);

        expect(scopes.has({ language: "en", domain: "main" })).toBe(true);
    });

    // Same as the isEqual scans this replaces; contentScopesAreEqual is the variant that ignores the class.
    it("does not find a class instance by an equal plain object", () => {
        const scopes = new ContentScopeSet([new DamScope("main")]);

        expect(scopes.has({ domain: "main" })).toBe(false);
    });

    it("does not find a scope carrying an additional dimension", () => {
        const scopes = new ContentScopeSet([{ domain: "main" }]);

        expect(scopes.has({ domain: "main", language: "en" })).toBe(false);
    });

    it("keeps null and undefined apart", () => {
        const scopes = new ContentScopeSet([{ domain: "main", language: null }]);

        expect(scopes.has({ domain: "main", language: null })).toBe(true);
        expect(scopes.has({ domain: "main", language: undefined })).toBe(false);
    });

    it("compares nested values", () => {
        const scopes = new ContentScopeSet([{ domain: "main", labels: { title: "Main" } }]);

        expect(scopes.has({ domain: "main", labels: { title: "Main" } })).toBe(true);
        expect(scopes.has({ domain: "main", labels: { title: "Other" } })).toBe(false);
    });

    it("reports an added scope as new only once, which deduplicates a list", () => {
        const scopes = new ContentScopeSet();
        const list = [
            { domain: "main", language: "en" },
            { language: "en", domain: "main" },
            { domain: "main", language: "de" },
        ];

        expect(list.filter((scope) => scopes.add(scope))).toEqual([
            { domain: "main", language: "en" },
            { domain: "main", language: "de" },
        ]);
    });

    it("returns the added scopes in insertion order", () => {
        const scopes = new ContentScopeSet([
            { domain: "main", language: "en" },
            { domain: "main", language: "de" },
        ]);

        expect(scopes.values()).toEqual([
            { domain: "main", language: "en" },
            { domain: "main", language: "de" },
        ]);
    });
});
