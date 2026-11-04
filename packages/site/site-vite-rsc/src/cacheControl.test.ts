import { describe, expect, it } from "vitest";

import { isSharedCacheable, noStoreCacheControl } from "./cacheControl.js";

describe("isSharedCacheable", () => {
    it("is true for responses a CDN may store", () => {
        expect(isSharedCacheable("s-maxage=450, stale-while-revalidate=31535550")).toBe(true);
        expect(isSharedCacheable("public, max-age=60")).toBe(true);
        expect(isSharedCacheable("no-cache")).toBe(true);
    });

    it("is false for private and no-store responses", () => {
        expect(isSharedCacheable(noStoreCacheControl)).toBe(false);
        expect(isSharedCacheable("private, max-age=60")).toBe(false);
        expect(isSharedCacheable("No-Store")).toBe(false);
    });
});
