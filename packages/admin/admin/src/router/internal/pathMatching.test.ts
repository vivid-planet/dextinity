import { matchPath } from "react-router";
import { describe, expect, it } from "vitest";

import { decodePathSegment, getPathnameBelowMatch, isPathnameStartingWith, matchAbsolutePath } from "./pathMatching";

function encodeLikeBrowserHistory(pathname: string) {
    return new URL(pathname, "http://localhost").pathname;
}

describe("matchAbsolutePath", () => {
    it.each([
        { pattern: "/products", pathname: "/products", end: true },
        { pattern: "/products", pathname: "/products/", end: true },
        { pattern: "/products", pathname: "/products/5", end: true },
        { pattern: "/products", pathname: "/products/5", end: false },
        { pattern: "/products", pathname: "/productsfoo", end: false },
        { pattern: "/Products", pathname: "/products/5", end: false },
        { pattern: "/products/:id/edit", pathname: "/products/5/edit/variants", end: false },
        { pattern: "/products/:id/edit", pathname: "/products/5/edit", end: true },
        { pattern: "/products/:id/edit", pathname: "/products//edit", end: false },
        { pattern: "/products/:id?", pathname: "/products", end: true },
        { pattern: "/products/:id?", pathname: "/products/5", end: true },
        { pattern: "/products/:id.json", pathname: "/products/5.json", end: true },
        { pattern: "/products/new?", pathname: "/products", end: true },
        { pattern: "/products/new?", pathname: "/products/new", end: true },
        { pattern: "/products/*", pathname: "/products/5/edit", end: false },
        { pattern: "/products/*", pathname: "/products", end: false },
        { pattern: "/*", pathname: "/products/5", end: false },
        { pattern: "/", pathname: "/products/5", end: false },
        { pattern: "/", pathname: "/", end: true },
        { pattern: "", pathname: "/products", end: false },
    ])("should match $pattern against $pathname (end: $end) like matchPath()", ({ pattern, pathname, end }) => {
        expect(matchAbsolutePath(pattern, pathname, { end })).toEqual(matchPath({ path: pattern, end }, pathname));
    });

    it("should collapse duplicate slashes in the pattern", () => {
        expect(matchAbsolutePath("//products//:id", "/products/5", { end: true })?.params).toEqual({ id: "5" });
    });

    it.each([
        ["/über/de/pages/:id/edit", "/%C3%BCber/de/pages/1/edit"],
        ["/%C3%BCber/de/pages/:id/edit", "/über/de/pages/1/edit"],
        ["/%C3%BCber/de/pages/:id/edit", "/%c3%bcber/de/pages/1/edit"],
        ["/main/de/pages/:id/edit", "/main/d%65/pages/1/edit"],
        ["/a b/:id", "/a%20b/1"],
        ["/Über/:id", "/%C3%BCBER/1"],
    ])("should match the pattern %s against %s regardless of the encoding", (pattern, pathname) => {
        expect(matchAbsolutePath(pattern, pathname, { end: false })?.params).toEqual({ id: "1" });
    });

    it("should compare the decoded literal segments of the pattern literally", () => {
        expect(matchAbsolutePath("/a%3Fb/:id", "/a%3fb/1", { end: true })?.params).toEqual({ id: "1" });
        expect(matchAbsolutePath("/a%3Fb/:id", "/b/1", { end: true })).toBeNull();
        expect(matchAbsolutePath("/%3Aid/edit", "/%3aid/edit", { end: true })?.params).toEqual({});
        expect(matchAbsolutePath("/%3Aid/edit", "/5/edit", { end: true })).toBeNull();
        expect(matchAbsolutePath("/a.b/:id", "/axb/1", { end: true })).toBeNull();
        expect(matchAbsolutePath("/a%2Fb/:id", "/a/b/1", { end: true })).toBeNull();
        expect(matchAbsolutePath("/a%2Fb/:id", "/a%2fb/1", { end: true })?.params).toEqual({ id: "1" });
    });

    it("should compare malformed segments as they are", () => {
        expect(matchAbsolutePath("/%E0%A4%A/:id", "/%E0%A4%A/1", { end: true })?.params).toEqual({ id: "1" });
        expect(matchAbsolutePath("/%E0%A4%A/:id", "/main/1", { end: true })).toBeNull();
    });

    it("should decode the params once", () => {
        expect(matchAbsolutePath("/pages/:id", "/pages/%C3%A4%2525", { end: true })?.params).toEqual({ id: "ä%25" });
        expect(matchAbsolutePath("/pages/:id", "/pages/a%2Fb", { end: true })?.params).toEqual({ id: "a/b" });
        expect(matchAbsolutePath("/pages/:id", "/pages/%E0%A4%A", { end: true })?.params).toEqual({ id: "%E0%A4%A" });
        expect(matchAbsolutePath("/pages/*", "/pages/%C3%A4/a%2Fb", { end: false })?.params).toEqual({ "*": "ä/a/b" });
    });

    it("should keep the matched URL decoded without encodePathname, except for characters that would change it", () => {
        const match = matchAbsolutePath("/%C3%BCber/de/pages/:id", "/über/d%65/pages/a%3Fb%23c%25d%2Fe/edit", { end: false });

        expect(match?.pathname).toBe("/über/de/pages/a%3Fb%23c%25d%2Fe");
        expect(match?.pathnameBase).toBe("/über/de/pages/a%3Fb%23c%25d%2Fe");
    });

    it("should encode the matched URL with encodePathname", () => {
        const match = matchAbsolutePath("/über/de/pages/:id", "/%c3%bcber/d%65/pages/%C3%A4%3F/edit", {
            end: false,
            encodePathname: encodeLikeBrowserHistory,
        });

        expect(match?.pathname).toBe("/%C3%BCber/de/pages/%C3%A4%3F");
        expect(match?.pathnameBase).toBe("/%C3%BCber/de/pages/%C3%A4%3F");
    });

    it("should keep trailing slashes in the pathname, but not in the pathnameBase", () => {
        const match = matchAbsolutePath("/products/:id", "/products/5//", { end: true });

        expect(match?.pathname).toBe("/products/5//");
        expect(match?.pathnameBase).toBe("/products/5");
    });

    it("should return the pattern with collapsed slashes", () => {
        expect(matchAbsolutePath("/products//:id", "/products/5", { end: false })?.pattern).toEqual({
            path: "/products/:id",
            end: false,
        });
    });
});

describe("isPathnameStartingWith", () => {
    it("should compare the decoded pathnames", () => {
        expect(isPathnameStartingWith("/%C3%BCber/de/pages/1/edit/sub/details", "/über/de/pages/1/edit/sub")).toBe(true);
        expect(isPathnameStartingWith("/über/de/pages/1/edit/sub", "/%C3%BCber/de/pages/1/edit/sub")).toBe(true);
        expect(isPathnameStartingWith("/main/d%65/pages/1/edit/sub", "/main/de/pages/1/edit/sub")).toBe(true);
    });

    it("should compare like a string prefix", () => {
        expect(isPathnameStartingWith("/foo/sub", "/foo/s")).toBe(true);
        expect(isPathnameStartingWith("/foo/sub", "/foo/sub/")).toBe(false);
        expect(isPathnameStartingWith("/Foo/sub", "/foo/sub")).toBe(false);
        expect(isPathnameStartingWith("/a%2Fb", "/a/b")).toBe(false);
    });
});

describe("getPathnameBelowMatch", () => {
    it("should return the rest of the pathname in its own encoding", () => {
        const pathname = "/%C3%BCber/de/pages/%C3%A4/edit";
        const match = matchAbsolutePath("/über/de/pages/:id", pathname, { end: false })!;

        expect(getPathnameBelowMatch(pathname, match)).toBe("edit");
    });

    it("should return the whole pathname below the root", () => {
        const pathname = "/pages/1";

        expect(getPathnameBelowMatch(pathname, matchAbsolutePath("/", pathname, { end: false })!)).toBe("pages/1");
    });

    it("should return an empty path for a match with trailing slashes", () => {
        const pathname = "/pages/1//";

        expect(getPathnameBelowMatch(pathname, matchAbsolutePath("/pages/:id", pathname, { end: true })!)).toBe("");
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
