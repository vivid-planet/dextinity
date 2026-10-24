import { describe, expect, it } from "vitest";

import { addRscPrefix, createRscUrl, stripRscPrefix } from "./rscRequest";

describe("addRscPrefix", () => {
    it("prefixes the pathname", () => {
        expect(addRscPrefix("/en/news")).toBe("/_rsc/en/news");
        expect(addRscPrefix("/")).toBe("/_rsc/");
    });
});

describe("stripRscPrefix", () => {
    it("strips the prefix and keeps the search", () => {
        expect(stripRscPrefix(new URL("https://example.com/_rsc/en/news?page=2"))?.href).toBe("https://example.com/en/news?page=2");
    });

    it("strips the prefix of the root page", () => {
        expect(stripRscPrefix(new URL("https://example.com/_rsc"))?.href).toBe("https://example.com/");
        expect(stripRscPrefix(new URL("https://example.com/_rsc/"))?.href).toBe("https://example.com/");
    });

    it("returns null for URLs without the prefix", () => {
        expect(stripRscPrefix(new URL("https://example.com/en/news"))).toBeNull();
        expect(stripRscPrefix(new URL("https://example.com/_rscnews"))).toBeNull();
        expect(stripRscPrefix(new URL("https://example.com/en/_rsc/news"))).toBeNull();
    });

    it("reverses addRscPrefix", () => {
        const url = new URL("https://example.com/en/news?page=2");
        url.pathname = addRscPrefix(url.pathname);

        expect(stripRscPrefix(url)?.href).toBe("https://example.com/en/news?page=2");
    });
});

describe("createRscUrl", () => {
    it("resolves the href against the current location, keeps the search and drops the hash", () => {
        window.history.replaceState(null, "", "/en/news");

        expect(createRscUrl("detail?page=2#comments").href).toBe(`${window.location.origin}/_rsc/en/detail?page=2`);
        expect(createRscUrl("/de").href).toBe(`${window.location.origin}/_rsc/de`);
    });
});
