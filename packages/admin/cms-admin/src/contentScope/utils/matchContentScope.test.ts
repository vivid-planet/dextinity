import { describe, expect, it } from "vitest";

import type { ContentScopePath } from "../Provider";
import { matchContentScope } from "./matchContentScope";

const domainAndLanguage: ContentScopePath = [
    { dimension: "domain", values: ["main", "secondary"] },
    { dimension: "language", values: ["de", "en"] },
];
const country: ContentScopePath = [{ dimension: "country", values: ["at", "de"] }];

describe("matchContentScope", () => {
    it("should match the URL of a scope", () => {
        expect(matchContentScope(domainAndLanguage, "/main/en")).toEqual({
            path: domainAndLanguage,
            match: { params: { domain: "main", language: "en" }, url: "/main/en", isExact: true },
        });
    });

    it("should match a URL below a scope", () => {
        expect(matchContentScope(domainAndLanguage, "/secondary/de/pages/pagetree/main-navigation")?.match).toEqual({
            params: { domain: "secondary", language: "de" },
            url: "/secondary/de",
            isExact: false,
        });
    });

    it("should match a URL with a trailing slash exactly", () => {
        expect(matchContentScope(domainAndLanguage, "/main/en/")?.match).toEqual({
            params: { domain: "main", language: "en" },
            url: "/main/en",
            isExact: true,
        });
    });

    it("should not match values that aren't allowed", () => {
        expect(matchContentScope(domainAndLanguage, "/main/fr")).toBeNull();
        expect(matchContentScope(domainAndLanguage, "/other/en")).toBeNull();
    });

    it("should only match whole segments", () => {
        expect(matchContentScope(domainAndLanguage, "/main/english")).toBeNull();
        expect(matchContentScope(domainAndLanguage, "/main/e")).toBeNull();
        expect(matchContentScope(domainAndLanguage, "/mainx/en")).toBeNull();
    });

    it("should not match a URL with fewer segments than dimensions", () => {
        expect(matchContentScope(domainAndLanguage, "/main")).toBeNull();
        expect(matchContentScope(domainAndLanguage, "/main/")).toBeNull();
        expect(matchContentScope(domainAndLanguage, "/")).toBeNull();
    });

    it("should not match empty segments", () => {
        expect(matchContentScope(domainAndLanguage, "//main/en")).toBeNull();
        expect(matchContentScope(domainAndLanguage, "/main//en")).toBeNull();
    });

    it("should match case-insensitively and keep the spelling of the URL in the params", () => {
        expect(matchContentScope(domainAndLanguage, "/Main/EN/pages")?.match).toEqual({
            params: { domain: "Main", language: "EN" },
            url: "/Main/EN",
            isExact: false,
        });
    });

    it("should decode the params", () => {
        const path: ContentScopePath = [{ dimension: "domain", values: ["dömain", "my domain"] }];

        expect(matchContentScope(path, "/d%C3%B6main/pages")?.match).toEqual({ params: { domain: "dömain" }, url: "/d%C3%B6main", isExact: false });
        expect(matchContentScope(path, "/my%20domain")?.match).toEqual({ params: { domain: "my domain" }, url: "/my%20domain", isExact: true });
    });

    it("should not throw for a malformed segment", () => {
        expect(matchContentScope([{ dimension: "domain", values: ["main"] }], "/%E0%A4%A/pages")).toBeNull();
    });

    it("should match null values written as dash", () => {
        const path: ContentScopePath = [
            { dimension: "domain", values: ["main"] },
            { dimension: "language", values: ["de", "-"] },
        ];

        expect(matchContentScope(path, "/main/-/pages")?.match).toEqual({
            params: { domain: "main", language: "-" },
            url: "/main/-",
            isExact: false,
        });
    });

    it("should use the first matching path", () => {
        const domain: ContentScopePath = [{ dimension: "domain", values: ["main"] }];

        expect(matchContentScope([domain, domainAndLanguage], "/main/en")).toEqual({
            path: domain,
            match: { params: { domain: "main" }, url: "/main", isExact: false },
        });
        expect(matchContentScope([domainAndLanguage, domain], "/main/en")).toEqual({
            path: domainAndLanguage,
            match: { params: { domain: "main", language: "en" }, url: "/main/en", isExact: true },
        });
    });

    it("should try the next path if a path doesn't match", () => {
        expect(matchContentScope([domainAndLanguage, country], "/at/products")).toEqual({
            path: country,
            match: { params: { country: "at" }, url: "/at", isExact: false },
        });
    });

    it("should not match if no path matches", () => {
        expect(matchContentScope([domainAndLanguage, country], "/fr/products")).toBeNull();
    });

    it("should match every URL with a path without dimensions", () => {
        expect(matchContentScope([], "/products")).toEqual({ path: [], match: { params: {}, url: "", isExact: false } });
        expect(matchContentScope([[]], "/")).toEqual({ path: [], match: { params: {}, url: "", isExact: true } });
    });
});
