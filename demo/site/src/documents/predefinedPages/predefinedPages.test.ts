import { describe, expect, it } from "vitest";

import { createPredefinedPageSitePath, matchPredefinedPage, type PredefinedPage } from "./predefinedPages";

const scope = { domain: "main", language: "en" };

const predefinedPages: PredefinedPage[] = [
    { type: "news", path: "/company/news", scope },
    { type: "news", path: "/aktuelles", scope: { domain: "main", language: "de" } },
];

describe("matchPredefinedPage", () => {
    it("should match the predefined page itself", () => {
        expect(matchPredefinedPage(predefinedPages, { path: "/company/news", scope })).toEqual({ predefinedPage: predefinedPages[0], path: "/" });
    });

    it("should match a sub path of the predefined page", () => {
        expect(matchPredefinedPage(predefinedPages, { path: "/company/news/my-article", scope })).toEqual({
            predefinedPage: predefinedPages[0],
            path: "/my-article",
        });
    });

    it("should not match a path that only shares a prefix", () => {
        expect(matchPredefinedPage(predefinedPages, { path: "/company/newsletter", scope })).toBeUndefined();
    });

    it("should not match a predefined page from another scope", () => {
        expect(matchPredefinedPage(predefinedPages, { path: "/aktuelles", scope })).toBeUndefined();
    });

    it("should match every path for a predefined page at the root", () => {
        const rootPredefinedPage: PredefinedPage = { type: "news", path: "/", scope };
        expect(matchPredefinedPage([rootPredefinedPage], { path: "/my-article", scope })).toEqual({
            predefinedPage: rootPredefinedPage,
            path: "/my-article",
        });
    });
});

describe("createPredefinedPageSitePath", () => {
    it("should create the path from the page tree location of the predefined page", () => {
        expect(createPredefinedPageSitePath({ predefinedPages, type: "news", scope, path: "/my-article" })).toBe("/en/company/news/my-article");
        expect(createPredefinedPageSitePath({ predefinedPages, type: "news", scope: { domain: "main", language: "de" } })).toBe("/de/aktuelles");
    });

    it("should create the path for a predefined page at the root", () => {
        expect(
            createPredefinedPageSitePath({ predefinedPages: [{ type: "news", path: "/", scope }], type: "news", scope, path: "/my-article" }),
        ).toBe("/en/my-article");
    });

    it("should return undefined if the scope has no predefined page of the type", () => {
        expect(createPredefinedPageSitePath({ predefinedPages, type: "news", scope: { domain: "secondary", language: "en" } })).toBeUndefined();
    });
});
