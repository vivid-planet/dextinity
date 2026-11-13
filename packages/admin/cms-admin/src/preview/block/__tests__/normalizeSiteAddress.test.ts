import { describe, expect, it } from "vitest";

import { normalizeSiteAddress } from "../normalizeSiteAddress";

describe("normalizeSiteAddress", () => {
    it("removes the trailing slash of a page path", () => {
        expect(normalizeSiteAddress("https://example.com/en/")).toBe("https://example.com/en");
        expect(normalizeSiteAddress("https://example.com/en/news/")).toBe("https://example.com/en/news");
    });

    it("keeps the query and the fragment", () => {
        expect(normalizeSiteAddress("https://example.com/en/?preview=1#top")).toBe("https://example.com/en?preview=1#top");
        expect(normalizeSiteAddress("https://example.com/en?redirect=/news/#top")).toBe("https://example.com/en?redirect=/news/#top");
    });

    it("keeps the slash of the site root and addresses without one", () => {
        expect(normalizeSiteAddress("https://example.com/")).toBe("https://example.com/");
        expect(normalizeSiteAddress("https://example.com/en/about")).toBe("https://example.com/en/about");
        expect(normalizeSiteAddress("/en/")).toBe("/en");
        expect(normalizeSiteAddress("/")).toBe("/");
    });
});
