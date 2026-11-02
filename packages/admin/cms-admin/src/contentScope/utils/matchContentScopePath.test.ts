import { describe, expect, it } from "vitest";

import { matchContentScopePath } from "./matchContentScopePath";

describe("matchContentScopePath", () => {
    it("should match allowed values", () => {
        expect(matchContentScopePath("/:domain(main|secondary)/:language(de|en)", "/secondary/en/pages")).toEqual({
            url: "/secondary/en",
            path: "/:domain/:language",
            params: { domain: "secondary", language: "en" },
        });
    });

    it("should not match values that aren't allowed", () => {
        expect(matchContentScopePath("/:domain(main|secondary)/:language(de|en)", "/main/fr")).toBeNull();
    });

    it("should only match whole segments", () => {
        expect(matchContentScopePath("/:domain(main)", "/mainx")).toBeNull();
    });

    it("should match params without allowed values and static segments", () => {
        expect(matchContentScopePath("/scope/:domain", "/scope/main")).toEqual({
            url: "/scope/main",
            path: "/scope/:domain",
            params: { domain: "main" },
        });
    });

    it("should match the root path", () => {
        expect(matchContentScopePath("/", "/foo")).toEqual({ url: "/", path: "/", params: {} });
    });
});
