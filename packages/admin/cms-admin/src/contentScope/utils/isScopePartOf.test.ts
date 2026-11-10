import { describe, expect, it } from "vitest";

import { isScopePartOf } from "./isScopePartOf";

describe("isScopePartOf", () => {
    it("should match an equal scope", () => {
        expect(isScopePartOf({ domain: "main", language: "de" }, { domain: "main", language: "de" })).toBe(true);
    });

    it("should match a scope with fewer dimensions", () => {
        expect(isScopePartOf({ domain: "main" }, { domain: "main", language: "de" })).toBe(true);
    });

    it("should not match a scope with a differing dimension", () => {
        expect(isScopePartOf({ domain: "main", language: "en" }, { domain: "main", language: "de" })).toBe(false);
    });

    it("should not match a scope with an additional dimension", () => {
        expect(isScopePartOf({ domain: "main", language: "de" }, { domain: "main" })).toBe(false);
    });

    it("should match an empty scope", () => {
        expect(isScopePartOf({}, { domain: "main" })).toBe(true);
    });

    it("should match null values", () => {
        expect(isScopePartOf({ domain: null }, { domain: null, language: "de" })).toBe(true);
    });
});
