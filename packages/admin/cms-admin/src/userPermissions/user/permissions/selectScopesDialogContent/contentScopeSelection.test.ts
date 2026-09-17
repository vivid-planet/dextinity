import { describe, expect, it } from "vitest";

import {
    type AvailableContentScope,
    availableContentScopeMatchesSelection,
    enumerableScopeCombinationExists,
    getDimensionOptions,
    getEnumerableDimensionNames,
    getEnumerableSelectionAfterChange,
    getRequiredEnumerableDimensions,
} from "./contentScopeSelection";

const ALL = "*";

// Every scope has both dimensions (main: en/de, secondary: en only).
const domainLanguageScopes: AvailableContentScope[] = [
    { scope: { domain: "main", language: "en" }, label: { domain: "Main", language: "English" } },
    { scope: { domain: "main", language: "de" }, label: { domain: "Main", language: "German" } },
    { scope: { domain: "secondary", language: "en" }, label: { domain: "Secondary", language: "English" } },
];

// Heterogeneous: "shop" has no language dimension.
const heterogeneousScopes: AvailableContentScope[] = [{ scope: { domain: "main", language: "en" } }, { scope: { domain: "shop" } }];

// Raw JSON values (numbers) as returned by the API.
const numericScopes: AvailableContentScope[] = [
    { scope: { tenant: 1 }, label: { tenant: "Tenant One" } },
    { scope: { tenant: 2 }, label: { tenant: "Tenant Two" } },
];

describe("getEnumerableDimensionNames", () => {
    it("returns the union of dimension keys", () => {
        expect(getEnumerableDimensionNames(domainLanguageScopes)).toEqual(["domain", "language"]);
        expect(getEnumerableDimensionNames(heterogeneousScopes)).toEqual(["domain", "language"]);
    });
});

describe("getRequiredEnumerableDimensions", () => {
    it("requires only dimensions present in every available scope", () => {
        expect(getRequiredEnumerableDimensions(domainLanguageScopes)).toEqual(["domain", "language"]);
        // language is missing from the "shop" scope, so it must stay optional.
        expect(getRequiredEnumerableDimensions(heterogeneousScopes)).toEqual(["domain"]);
    });
});

describe("availableContentScopeMatchesSelection", () => {
    it("matches on a partial selection", () => {
        expect(availableContentScopeMatchesSelection({ domain: "main", language: "en" }, { domain: "main" })).toBe(true);
        expect(availableContentScopeMatchesSelection({ domain: "main", language: "en" }, { domain: "secondary" })).toBe(false);
    });

    it("compares raw JSON values as strings", () => {
        expect(availableContentScopeMatchesSelection({ tenant: 1 }, { tenant: "1" })).toBe(true);
        expect(availableContentScopeMatchesSelection({ tenant: 2 }, { tenant: "1" })).toBe(false);
    });

    it("treats a wildcard as matching any present value, but not an absent dimension", () => {
        expect(availableContentScopeMatchesSelection({ domain: "main", language: "en" }, { domain: ALL })).toBe(true);
        expect(availableContentScopeMatchesSelection({ domain: "shop" }, { language: ALL })).toBe(false);
    });

    it("matches on an empty selection", () => {
        expect(availableContentScopeMatchesSelection({ domain: "main" }, {})).toBe(true);
    });
});

describe("getDimensionOptions", () => {
    it("lists the dimension's values with an 'All' option first", () => {
        expect(getDimensionOptions({ dimension: "domain", scope: {}, availableContentScopes: domainLanguageScopes, allValuesLabel: "All" })).toEqual([
            { value: ALL, label: "All" },
            { value: "main", label: "Main" },
            { value: "secondary", label: "Secondary" },
        ]);
    });

    it("cascades: only values valid for the other selection are offered", () => {
        expect(
            getDimensionOptions({
                dimension: "language",
                scope: { domain: "secondary" },
                availableContentScopes: domainLanguageScopes,
                allValuesLabel: "All",
            }),
        ).toEqual([
            { value: ALL, label: "All" },
            { value: "en", label: "English" },
        ]);
    });

    it("does not let a wildcard sibling over-constrain the options", () => {
        expect(
            getDimensionOptions({
                dimension: "language",
                scope: { domain: ALL },
                availableContentScopes: domainLanguageScopes,
                allValuesLabel: "All",
            }),
        ).toEqual([
            { value: ALL, label: "All" },
            { value: "en", label: "English" },
            { value: "de", label: "German" },
        ]);
    });

    it("offers no options (and no 'All') when the selection has no valid combination", () => {
        expect(
            getDimensionOptions({
                dimension: "language",
                scope: { domain: "does-not-exist" },
                availableContentScopes: domainLanguageScopes,
                allValuesLabel: "All",
            }),
        ).toEqual([]);
    });

    it("stringifies raw JSON values and falls back to the value when no label exists", () => {
        expect(getDimensionOptions({ dimension: "tenant", scope: {}, availableContentScopes: numericScopes, allValuesLabel: "All" })).toEqual([
            { value: ALL, label: "All" },
            { value: "1", label: "Tenant One" },
            { value: "2", label: "Tenant Two" },
        ]);
    });
});

describe("getEnumerableSelectionAfterChange", () => {
    it("keeps a sibling selection when the new combination still exists", () => {
        expect(
            getEnumerableSelectionAfterChange({
                availableContentScopes: domainLanguageScopes,
                scope: { domain: "main", language: "en" },
                dimension: "domain",
                value: "secondary",
            }),
        ).toEqual({ domain: "secondary", language: "en" });
    });

    it("drops a sibling selection when the new combination no longer exists", () => {
        // secondary has no German scope, so language is cleared.
        expect(
            getEnumerableSelectionAfterChange({
                availableContentScopes: domainLanguageScopes,
                scope: { domain: "main", language: "de" },
                dimension: "domain",
                value: "secondary",
            }),
        ).toEqual({ domain: "secondary" });
    });

    it("keeps a sibling selection when switching a dimension to the wildcard", () => {
        expect(
            getEnumerableSelectionAfterChange({
                availableContentScopes: domainLanguageScopes,
                scope: { domain: "main", language: "en" },
                dimension: "domain",
                value: ALL,
            }),
        ).toEqual({ domain: ALL, language: "en" });
    });
});

describe("enumerableScopeCombinationExists", () => {
    it("accepts an existing concrete combination and rejects a non-existing one", () => {
        expect(enumerableScopeCombinationExists({ scope: { domain: "main", language: "en" }, availableContentScopes: domainLanguageScopes })).toBe(
            true,
        );
        expect(
            enumerableScopeCombinationExists({ scope: { domain: "secondary", language: "de" }, availableContentScopes: domainLanguageScopes }),
        ).toBe(false);
    });

    it("accepts a wildcard when at least one matching value exists", () => {
        expect(enumerableScopeCombinationExists({ scope: { domain: ALL, language: "en" }, availableContentScopes: domainLanguageScopes })).toBe(true);
        expect(enumerableScopeCombinationExists({ scope: { domain: ALL, language: "de" }, availableContentScopes: domainLanguageScopes })).toBe(true);
    });

    it("normalizes raw JSON values", () => {
        expect(enumerableScopeCombinationExists({ scope: { tenant: "1" }, availableContentScopes: numericScopes })).toBe(true);
        expect(enumerableScopeCombinationExists({ scope: { tenant: "3" }, availableContentScopes: numericScopes })).toBe(false);
    });

    it("treats an omitted optional dimension as selecting the scopes that also lack it", () => {
        expect(enumerableScopeCombinationExists({ scope: { domain: "shop" }, availableContentScopes: heterogeneousScopes })).toBe(true);
        // "shop" has no language, so a concrete or wildcard language cannot match it.
        expect(enumerableScopeCombinationExists({ scope: { domain: "shop", language: "en" }, availableContentScopes: heterogeneousScopes })).toBe(
            false,
        );
        expect(enumerableScopeCombinationExists({ scope: { domain: "shop", language: ALL }, availableContentScopes: heterogeneousScopes })).toBe(
            false,
        );
    });
});
