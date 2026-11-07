import { describe, expect, it } from "vitest";

import { sanitizeHtml } from "../sanitizeHtml";

describe("sanitizeHtml", () => {
    it("keeps the editor's formatting", () => {
        const html =
            '<h3>Tasks</h3><p>We <strong>design</strong> and <em>build</em> <a href="https://example.com">things</a>.</p><ul><li>One</li></ul><ol><li>Two</li></ol>';
        expect(sanitizeHtml(html)).toBe(html);
    });

    it("removes scripts, event handlers, and unsafe links", () => {
        expect(sanitizeHtml('<p onclick="alert(1)">Hi<script>alert(1)</script> <a href="javascript:alert(1)">x</a></p>')).toBe("<p>Hi <a>x</a></p>");
    });

    it("unwraps unknown elements and maps blocks to paragraphs and headings", () => {
        expect(sanitizeHtml('<div><span style="color: red">Red</span></div><h1>Title</h1>')).toBe("<p>Red</p><h3>Title</h3>");
    });
});
