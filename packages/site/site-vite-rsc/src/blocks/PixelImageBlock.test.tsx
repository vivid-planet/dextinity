// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { PixelImageBlockData } from "../blocks.generated.js";
import { ImageConfigProvider } from "../image/ImageConfigProvider.js";
import { PixelImageBlock } from "./PixelImageBlock.js";

const data: PixelImageBlockData = {
    damFile: {
        id: "id",
        name: "image.jpg",
        size: 1000,
        mimetype: "image/jpeg",
        contentHash: "hash",
        title: "Title",
        altText: "Alt text",
        archived: false,
        image: { width: 2000, height: 1000, cropArea: { focalPoint: "SMART" }, dominantColor: "#336699" },
        fileUrl: "https://api.example.com/dam/files/image.jpg",
    },
    urlTemplate: "https://api.example.com/dam/images/hash/$resizeWidth/$resizeHeight/image.jpg",
};

function render(image: React.ReactNode) {
    return renderToString(<ImageConfigProvider config={{ deviceSizes: [640], imageSizes: [] }}>{image}</ImageConfigProvider>);
}

describe("PixelImageBlock", () => {
    it("renders the DAM image in a container with the aspect ratio", () => {
        const html = render(<PixelImageBlock data={data} aspectRatio="16x9" />);

        expect(html).toMatch(/^<div style="position:relative;width:100%;aspect-ratio:1.7777777777777777">/);
        expect(html).toContain('alt="Alt text"');
        expect(html).toContain('title="Title"');
        expect(html).toContain("background-color:#336699");
        expect(html).toContain('src="https://api.example.com/dam/images/hash/640/360/image.jpg"');
    });

    it("inherits the aspect ratio of the image", () => {
        expect(render(<PixelImageBlock data={data} aspectRatio="inherit" />)).toContain(
            'src="https://api.example.com/dam/images/hash/640/320/image.jpg"',
        );
    });

    it("renders only the image when it fills the parent", () => {
        expect(render(<PixelImageBlock data={data} aspectRatio="16x9" fill />)).toMatch(/^<img /);
    });
});
