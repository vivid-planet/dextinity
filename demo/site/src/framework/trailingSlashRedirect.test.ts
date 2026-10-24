// @vitest-environment node
import { describe, expect, it } from "vitest";

import { getPathnameWithoutTrailingSlash } from "./trailingSlashRedirect";

describe("getPathnameWithoutTrailingSlash", () => {
    it("removes trailing slashes", () => {
        expect(getPathnameWithoutTrailingSlash("/en/")).toBe("/en");
        expect(getPathnameWithoutTrailingSlash("/en/news/")).toBe("/en/news");
        expect(getPathnameWithoutTrailingSlash("/en/news//")).toBe("/en/news");
    });

    it("keeps the root and pathnames without a trailing slash", () => {
        expect(getPathnameWithoutTrailingSlash("/")).toBeUndefined();
        expect(getPathnameWithoutTrailingSlash("/en")).toBeUndefined();
        expect(getPathnameWithoutTrailingSlash("/en/news")).toBeUndefined();
    });

    it("redirects multiple slashes to the root", () => {
        expect(getPathnameWithoutTrailingSlash("//")).toBe("/");
        expect(getPathnameWithoutTrailingSlash("///")).toBe("/");
    });

    it("doesn't redirect to another host", () => {
        expect(getPathnameWithoutTrailingSlash("//example.com/")).toBe("/example.com");
        expect(getPathnameWithoutTrailingSlash("///example.com/path/")).toBe("/example.com/path");
    });
});
