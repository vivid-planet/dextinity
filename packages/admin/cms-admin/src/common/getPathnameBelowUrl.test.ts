import { describe, expect, it } from "vitest";

import { decodePathSegment, getPathnameBelowUrl } from "./getPathnameBelowUrl";

describe("getPathnameBelowUrl", () => {
    it("should return an empty path for the URL itself", () => {
        expect(getPathnameBelowUrl("/main/en", "/main/en")).toBe("");
        expect(getPathnameBelowUrl("/main/en/", "/main/en")).toBe("");
    });

    it("should return the path below the URL", () => {
        expect(getPathnameBelowUrl("/main/en/pages/pagetree", "/main/en")).toBe("/pages/pagetree");
        expect(getPathnameBelowUrl("/main/en/pages/", "/main/en")).toBe("/pages");
    });

    it("should return null for a pathname that isn't below the URL", () => {
        expect(getPathnameBelowUrl("/main/de/pages", "/main/en")).toBeNull();
        expect(getPathnameBelowUrl("/main", "/main/en")).toBeNull();
        expect(getPathnameBelowUrl("/main/english", "/main/en")).toBeNull();
    });

    it("should compare empty segments like other segments", () => {
        expect(getPathnameBelowUrl("/main/en//pages", "/main/en")).toBe("//pages");
        expect(getPathnameBelowUrl("/main/en//", "/main/en")).toBe("/");
        expect(getPathnameBelowUrl("/main//en", "/main/en")).toBeNull();
    });

    it("should return the whole pathname below the root URL", () => {
        expect(getPathnameBelowUrl("/main/en", "/")).toBe("/main/en");
        expect(getPathnameBelowUrl("/main/en", "")).toBe("/main/en");
        expect(getPathnameBelowUrl("/", "/")).toBe("");
    });

    it("should compare encoded and decoded segments", () => {
        expect(getPathnameBelowUrl("/%C3%BCber/de/pages", "/über/de")).toBe("/pages");
        expect(getPathnameBelowUrl("/über/de/pages", "/%C3%BCber/de")).toBe("/pages");
        expect(getPathnameBelowUrl("/a%20b/de", "/a b/de")).toBe("");
    });

    it("should compare segments that are encoded differently", () => {
        expect(getPathnameBelowUrl("/%c3%bcber/de/pages", "/%C3%BCber/de")).toBe("/pages");
        expect(getPathnameBelowUrl("/main/d%65/pages", "/main/de")).toBe("/pages");
    });

    it("should compare case-insensitively", () => {
        expect(getPathnameBelowUrl("/Main/EN/pages", "/main/en")).toBe("/pages");
    });

    it("should keep the encoding of the pathname in the path below the URL", () => {
        expect(getPathnameBelowUrl("/über/de/pages/%C3%BCbersicht", "/%C3%BCber/de")).toBe("/pages/%C3%BCbersicht");
        expect(getPathnameBelowUrl("/%C3%BCber/de/pages/übersicht", "/über/de")).toBe("/pages/übersicht");
    });

    it("should compare malformed segments as they are", () => {
        expect(getPathnameBelowUrl("/%E0%A4%A/pages", "/%E0%A4%A")).toBe("/pages");
        expect(getPathnameBelowUrl("/%E0%A4%A/pages", "/main")).toBeNull();
    });
});

describe("decodePathSegment", () => {
    it("should decode a segment", () => {
        expect(decodePathSegment("%C3%BCber")).toBe("über");
        expect(decodePathSegment("a%2Fb")).toBe("a/b");
    });

    it("should keep a malformed segment as it is", () => {
        expect(decodePathSegment("%E0%A4%A")).toBe("%E0%A4%A");
    });
});
