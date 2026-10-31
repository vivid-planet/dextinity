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

    it("doesn't request widths larger than the cropped image", () => {
        const html = renderToString(
            <ImageConfigProvider config={{ deviceSizes: [640, 1080, 1920, 3840], imageSizes: [] }}>
                <PixelImageBlock data={{ ...data, cropArea: { focalPoint: "NORTHWEST", width: 50, height: 100, x: 0, y: 0 } }} aspectRatio="1x1" />
            </ImageConfigProvider>,
        );

        // The crop area of 1000x1000 pixels fits the aspect ratio completely
        expect(html).toContain(
            'srcSet="https://api.example.com/dam/images/hash/640/640/image.jpg 640w, https://api.example.com/dam/images/hash/1080/1080/image.jpg 1080w"',
        );
    });

    it("limits the widths by the height of the image for narrower aspect ratios", () => {
        const html = renderToString(
            <ImageConfigProvider config={{ deviceSizes: [640, 1080, 1920, 3840], imageSizes: [] }}>
                <PixelImageBlock data={data} aspectRatio="1x1" />
            </ImageConfigProvider>,
        );

        // The image of 2000x1000 pixels is cropped to 1000x1000 pixels
        expect(html).toContain('src="https://api.example.com/dam/images/hash/1080/1080/image.jpg"');
        expect(html).not.toContain("1920w");
    });

    it("renders only the image when it fills the parent", () => {
        expect(render(<PixelImageBlock data={data} aspectRatio="16x9" fill />)).toMatch(/^<img /);
    });
});
