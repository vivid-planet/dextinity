import { describe, expect, it } from "vitest";

import { isAllowedRedirectTarget } from "./redirectTarget.js";

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
