import { createSitePath } from "@src/util/createSitePath";
import { describe, expect, it } from "vitest";

describe("createSitePath", () => {
    it("prefixes the path with the scope's language", () => {
        expect(createSitePath({ path: "/news", scope: { language: "en" } })).toBe("/en/news");
    });

    it("returns the path of the language for the home page", () => {
        expect(createSitePath({ path: "/", scope: { language: "en" } })).toBe("/en");
    });

    it("throws when the path doesn't start with a slash", () => {
        expect(() => createSitePath({ path: "news", scope: { language: "en" } })).toThrow("Path must start with a `/`.");
    });
});
