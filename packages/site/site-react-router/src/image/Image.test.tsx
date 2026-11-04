import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { Image } from "./Image.js";
import { ImageConfigProvider } from "./ImageConfigProvider.js";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

const config = { deviceSizes: [640, 1080], imageSizes: [320] };
const src = "https://api.example.com/dam/images/hash/$resizeWidth/$resizeHeight/image.jpg";

function render(image: React.ReactNode) {
    return renderToString(<ImageConfigProvider config={config}>{image}</ImageConfigProvider>);
}

describe("Image", () => {
    it("renders a lazy loading image with a srcset of the configured widths", () => {
        const html = render(<Image src={src} aspectRatio="16x9" sizes="50vw" alt="Alt" />);

        expect(html).toContain(
            'srcSet="https://api.example.com/dam/images/hash/320/180/image.jpg 320w, https://api.example.com/dam/images/hash/640/360/image.jpg 640w, https://api.example.com/dam/images/hash/1080/608/image.jpg 1080w"',
        );
        expect(html).toContain('src="https://api.example.com/dam/images/hash/1080/608/image.jpg"');
        expect(html).toContain('sizes="50vw"');
        expect(html).toContain('loading="lazy"');
        expect(html).not.toContain('rel="preload"');
    });

    it("shows the placeholder color until the image has loaded", () => {
        expect(render(<Image src={src} aspectRatio="1x1" placeholderColor="#ff0000" />)).toContain("background-color:#ff0000");
    });

    it("removes the placeholder color when the image has loaded and calls onLoad", async () => {
        const onLoad = vi.fn();
        const container = document.createElement("div");
        const root = createRoot(container);
        await act(() =>
            root.render(
                <ImageConfigProvider config={config}>
                    <Image src={src} aspectRatio="1x1" placeholderColor="#ff0000" onLoad={onLoad} />
                </ImageConfigProvider>,
            ),
        );
        const [image] = container.getElementsByTagName("img");

        await act(() => image.dispatchEvent(new Event("load")));

        expect(image.style.backgroundColor).toBe("");
        expect(onLoad).toHaveBeenCalledOnce();
        act(() => root.unmount());
    });

    it("preloads the image with high priority", () => {
        const html = render(<Image src={src} aspectRatio="16x9" preload />);

        const preloadLink = html.match(/<link rel="preload"[^>]+>/)?.[0];
        expect(preloadLink).toContain('as="image"');
        expect(preloadLink).toContain('fetchPriority="high"');
        expect(preloadLink).toContain('imageSizes="100vw"');
        expect(preloadLink).toMatch(/imageSrcSet="[^"]+ 640w, [^"]+ 1080w"/);
        expect(html).toContain('loading="eager"');
        expect(html).toContain('fetchPriority="high"');
    });

    it("needs the image widths of the API", () => {
        expect(() => renderToString(<Image src={src} aspectRatio="16x9" />)).toThrow("render an ImageConfigProvider in the root layout");
    });
});
