import type { PixelImageBlockData } from "../../../blocks.generated.js";

export const exampleBlockData: PixelImageBlockData = {
    damFile: {
        id: "example-image",
        name: "example-image.jpg",
        size: 1000000,
        mimetype: "image/jpeg",
        contentHash: "example-hash",
        title: null,
        altText: null,
        aiContentType: null,
        archived: false,
        scope: { domain: "at" },
        fileUrl: "https://picsum.photos/seed/dextinity-pixel-image/1000/1000",
        image: {
            width: 1000,
            height: 1000,
            cropArea: { focalPoint: "SMART", width: null, height: null, x: null, y: null },
            dominantColor: "#000000",
        },
    },
    cropArea: null,
    urlTemplate: "https://picsum.photos/seed/dextinity-pixel-image/$resizeWidth/$resizeHeight",
};
