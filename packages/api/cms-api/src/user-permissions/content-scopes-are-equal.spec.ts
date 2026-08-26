import { describe, expect, it } from "vitest";

import { contentScopesAreEqual } from "./content-scopes-are-equal";

class DamScope {
    constructor(public domain: string) {}
}

describe("contentScopesAreEqual", () => {
    it("considers a class instance and a plain object with the same values equal", () => {
        expect(contentScopesAreEqual(new DamScope("main"), { domain: "main" })).toBe(true);
    });

    it("considers scopes with different values unequal", () => {
        expect(contentScopesAreEqual({ domain: "main" }, { domain: "secondary" })).toBe(false);
    });

    it("considers scopes with different keys unequal", () => {
        expect(contentScopesAreEqual({ domain: "main" }, { domain: "main", language: "en" })).toBe(false);
    });

    it("considers two undefined scopes equal", () => {
        expect(contentScopesAreEqual(undefined, undefined)).toBe(true);
    });

    it("considers an undefined scope and a scope with values unequal", () => {
        expect(contentScopesAreEqual(undefined, { domain: "main" })).toBe(false);
    });
});
