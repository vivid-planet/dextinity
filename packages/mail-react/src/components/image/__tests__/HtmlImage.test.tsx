import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { HtmlImage } from "../HtmlImage.js";

describe("HtmlImage", () => {
    it("writes borderRadius into the style attribute", () => {
        const html = renderToStaticMarkup(<HtmlImage src="image.jpg" alt="" borderRadius={8} />);

        expect(html).toMatch(/<img[^>]*style="[^"]*border-radius:8px/);
    });

    it("lets a caller-supplied style win over the borderRadius prop", () => {
        const html = renderToStaticMarkup(<HtmlImage src="image.jpg" alt="" borderRadius={8} style={{ borderRadius: 2 }} />);

        expect(html).toContain("border-radius:2px");
        expect(html).not.toContain("border-radius:8px");
    });
});
