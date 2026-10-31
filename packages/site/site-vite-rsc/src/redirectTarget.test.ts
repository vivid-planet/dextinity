import { describe, expect, it } from "vitest";

import { isAllowedRedirectTarget, resolveRedirectTarget } from "./redirectTarget.js";

describe("isAllowedRedirectTarget", () => {
    it.each([
        "/en/page",
        "page",
        "?page=2",
        "#section",
        "//example.com/page",
        "https://example.com/page",
        "http://example.com/page",
        "mailto:office@example.com",
        "tel:+431234",
    ])("allows %s", (location) => {
        expect(isAllowedRedirectTarget(location)).toBe(true);
    });

    it.each([
        "javascript:alert(1)",
        " JavaScript:alert(1)",
        "java\tscript:alert(1)",
        "data:text/html,<script>alert(1)</script>",
        "file:///etc/passwd",
        "ftp://example.com/file",
        "http://",
    ])("rejects %s", (location) => {
        expect(isAllowedRedirectTarget(location)).toBe(false);
    });
});

describe("resolveRedirectTarget", () => {
    const pageUrl = new URL("https://example.com/en/news/old?page=2#comments");

    it("resolves relative targets against the page", () => {
        expect(resolveRedirectTarget("/en/new", pageUrl)?.href).toBe("https://example.com/en/new#comments");
        expect(resolveRedirectTarget("new", pageUrl)?.href).toBe("https://example.com/en/news/new#comments");
        expect(resolveRedirectTarget("?page=3", pageUrl)?.href).toBe("https://example.com/en/news/old?page=3#comments");
        expect(resolveRedirectTarget("//other.example.com/", pageUrl)?.href).toBe("https://other.example.com/#comments");
    });

    it("keeps the fragment of the target", () => {
        expect(resolveRedirectTarget("/en/new#top", pageUrl)?.href).toBe("https://example.com/en/new#top");
    });

    it("doesn't add the fragment to mailto and tel targets", () => {
        expect(resolveRedirectTarget("mailto:office@example.com", pageUrl)?.href).toBe("mailto:office@example.com");
        expect(resolveRedirectTarget("tel:+431234", pageUrl)?.href).toBe("tel:+431234");
    });

    it("rejects disallowed targets", () => {
        expect(resolveRedirectTarget("javascript:alert(1)", pageUrl)).toBeUndefined();
    });
});
