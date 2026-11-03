import { describe, expect, it } from "vitest";

import { createIsScopeWithinAny, isScopeWithin } from "./access-control.service";
import type { ContentScope } from "./interfaces/content-scope.interface";

function scope(values: Record<string, unknown>): ContentScope {
    return values as ContentScope;
}

describe("createIsScopeWithinAny", () => {
    it("matches an exactly equal scope", () => {
        const isScopeWithinAny = createIsScopeWithinAny([scope({ domain: "main", language: "de" })]);
        expect(isScopeWithinAny(scope({ domain: "main", language: "de" }))).toBe(true);
        expect(isScopeWithinAny(scope({ language: "de", domain: "main" }))).toBe(true);
        expect(isScopeWithinAny(scope({ domain: "main", language: "en" }))).toBe(false);
    });

    it("ignores dimensions of the containing scope that the scope doesn't have", () => {
        const isScopeWithinAny = createIsScopeWithinAny([scope({ domain: "main", language: "de" })]);
        expect(isScopeWithinAny(scope({ domain: "main" }))).toBe(true);
        expect(isScopeWithinAny(scope({}))).toBe(true);
        expect(isScopeWithinAny(scope({ domain: "main", language: "de", region: "at" }))).toBe(false);
    });

    it("matches wildcard dimensions", () => {
        const isScopeWithinAny = createIsScopeWithinAny([scope({ domain: "*", language: "de" })]);
        expect(isScopeWithinAny(scope({ domain: "main", language: "de" }))).toBe(true);
        expect(isScopeWithinAny(scope({ domain: "secondary", language: "de" }))).toBe(true);
        expect(isScopeWithinAny(scope({ domain: "main", language: "en" }))).toBe(false);
    });

    it("treats null and undefined the same", () => {
        const isScopeWithinAny = createIsScopeWithinAny([scope({ domain: "main", language: null })]);
        expect(isScopeWithinAny(scope({ domain: "main", language: null }))).toBe(true);
        expect(isScopeWithinAny(scope({ domain: "main", language: undefined }))).toBe(true);
        expect(createIsScopeWithinAny([scope({ domain: "main" })])(scope({ domain: "main", language: null }))).toBe(true);
        expect(isScopeWithinAny(scope({ domain: "main", language: "de" }))).toBe(false);
    });

    it("handles duplicate containing scopes", () => {
        const containingScopes = Array.from({ length: 1000 }, () => [
            scope({ domain: "main", language: "de" }),
            scope({ domain: "*", language: "en" }),
        ]).flat();
        const isScopeWithinAny = createIsScopeWithinAny(containingScopes);
        expect(isScopeWithinAny(scope({ domain: "main", language: "de" }))).toBe(true);
        expect(isScopeWithinAny(scope({ domain: "secondary", language: "en" }))).toBe(true);
        expect(isScopeWithinAny(scope({ domain: "secondary", language: "de" }))).toBe(false);
    });

    it("doesn't match values that are only equal after serialization", () => {
        expect(createIsScopeWithinAny([scope({ domain: "1" })])(scope({ domain: 1 }))).toBe(false);
        expect(createIsScopeWithinAny([scope({ domain: null })])(scope({ domain: Number.NaN }))).toBe(false);
        expect(createIsScopeWithinAny([scope({ domain: { id: 1 } })])(scope({ domain: { id: 1 } }))).toBe(false);
    });

    it("returns the same result as checking isScopeWithin for every containing scope", () => {
        const values = ["a", "b", "*", null, undefined];
        const scopes: ContentScope[] = [];
        for (const domain of values) {
            for (const language of values) {
                scopes.push(scope({ domain, language }), scope({ domain }), scope({ domain, language, region: language }));
            }
        }
        for (let i = 0; i < scopes.length; i += 7) {
            const containingScopes = scopes.slice(i, i + 11);
            const isScopeWithinAny = createIsScopeWithinAny(containingScopes);
            for (const s of scopes) {
                expect(isScopeWithinAny(s)).toBe(containingScopes.some((containingScope) => isScopeWithin(s, containingScope)));
            }
        }
    });
});
