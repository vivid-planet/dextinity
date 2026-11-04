import { renderToStaticMarkup } from "react-dom/server";
import type { Article, Organization, WithContext } from "schema-dts";
import { describe, expect, it } from "vitest";

import { JsonLd } from "./JsonLd";

describe("JsonLd", () => {
    it("renders an application/ld+json script tag", () => {
        const html = renderToStaticMarkup(
            <JsonLd<Organization>
                data={{
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    name: "Acme",
                }}
            />,
        );

        expect(html).toMatch(/^<script type="application\/ld\+json">/);
        expect(html).toMatch(/<\/script>$/);
    });

    it("escapes `<` to prevent breaking out of the script tag", () => {
        const html = renderToStaticMarkup(
            <JsonLd<Article>
                data={{
                    "@context": "https://schema.org",
                    "@type": "Article",
                    headline: "</script><script>alert(1)</script>",
                }}
            />,
        );

        // Only the wrapping <script> tags should remain — the payload's `<` chars are escaped.
        expect(html.match(/<script\b/g)).toHaveLength(1);
        expect(html.match(/<\/script>/g)).toHaveLength(1);
        expect(html).toContain("\\u003c/script>\\u003cscript>alert(1)\\u003c/script>");
    });

    it("round-trips schema.org data", () => {
        const data: WithContext<Organization> = {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Acme",
            url: "https://acme.example",
            sameAs: ["https://example.com/acme", "https://other.example/acme"],
        };
        const html = renderToStaticMarkup(<JsonLd<Organization> data={data} />);

        const json = html.replace(/^<script type="application\/ld\+json">/, "").replace(/<\/script>$/, "");
        // React's renderToStaticMarkup leaves our `<` escapes intact in the output;
        // JSON.parse decodes them back to `<`.
        expect(JSON.parse(json)).toEqual(data);
    });
});
