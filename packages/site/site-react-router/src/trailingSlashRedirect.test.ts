// @vitest-environment node
import { describe, expect, it } from "vitest";

import { trailingSlashRedirect } from "./trailingSlashRedirect";

describe("trailingSlashRedirect", () => {
    it("redirects to the path without the trailing slash and keeps the query", () => {
        const response = trailingSlashRedirect(new Request("http://localhost/en/news/?page=2"));

        expect(response?.status).toBe(308);
        expect(response?.headers.get("Location")).toBe("/en/news?page=2");
    });

    it("doesn't redirect the root and paths without a trailing slash", () => {
        expect(trailingSlashRedirect(new Request("http://localhost/"))).toBeUndefined();
        expect(trailingSlashRedirect(new Request("http://localhost/en/news"))).toBeUndefined();
    });

    it("doesn't redirect to other hosts", () => {
        expect(trailingSlashRedirect(new Request("http://localhost//example.com/"))?.headers.get("Location")).toBe("/example.com");
    });
});
