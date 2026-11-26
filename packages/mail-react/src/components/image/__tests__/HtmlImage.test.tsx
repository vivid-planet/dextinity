import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../../../config/ConfigProvider.js";
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

    it("gives classic Outlook a VML shape and hides the image from it", () => {
        const html = renderToStaticMarkup(<HtmlImage src="image.jpg" alt="A photo" width={536} height={301} borderRadius={16} />);

        expect(html).toContain("<!--[if mso]><v:roundrect");
        expect(html).toContain("<![endif]--><!--[if !mso]><!--></span><img");
        expect(html).toContain("<!--<![endif]-->");
    });

    it("leaves the markup untouched when the height is unknown", () => {
        const html = renderToStaticMarkup(<HtmlImage src="image.jpg" alt="A photo" width={536} borderRadius={16} />);

        expect(html).not.toContain("v:roundrect");
        expect(html).not.toContain("<span");
    });

    it("rounds the VML shape by the same radius as the image", () => {
        const html = renderToStaticMarkup(
            <HtmlImage src="image.jpg" alt="A photo" width={100} height={100} borderRadius={50} style={{ borderRadius: 10 }} />,
        );

        expect(html).toContain('arcsize="10%"');
    });

    it("renders the src that config.rewriteImageSrc returns, in the image and in the Outlook VML", () => {
        const html = renderToStaticMarkup(
            <ConfigProvider config={{ rewriteImageSrc: ({ src }) => `cid:${src}` }}>
                <HtmlImage src="image.jpg" alt="A photo" width={100} height={100} borderRadius={10} />
            </ConfigProvider>,
        );

        expect(html).toMatch(/<img[^>]*src="cid:image.jpg"/);
        expect(html).toContain('<v:fill type="frame" src="cid:image.jpg"');
        expect(html).not.toContain('"image.jpg"');
    });

    it("passes the image's src, width and height to config.rewriteImageSrc", () => {
        const rewriteImageSrc = vi.fn(({ src }: { src: string }) => src);

        renderToStaticMarkup(
            <ConfigProvider config={{ rewriteImageSrc }}>
                <HtmlImage src="image.jpg" alt="" width={100} height="50" />
            </ConfigProvider>,
        );

        expect(rewriteImageSrc).toHaveBeenCalledWith({ src: "image.jpg", width: 100, height: "50" });
    });

    it("does not call config.rewriteImageSrc for an image without a src", () => {
        const rewriteImageSrc = vi.fn(({ src }: { src: string }) => src);

        const html = renderToStaticMarkup(
            <ConfigProvider config={{ rewriteImageSrc }}>
                <HtmlImage alt="" />
            </ConfigProvider>,
        );

        expect(rewriteImageSrc).not.toHaveBeenCalled();
        expect(html).not.toContain("src=");
    });
});
