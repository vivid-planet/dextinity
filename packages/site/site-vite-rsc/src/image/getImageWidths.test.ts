import { describe, expect, it } from "vitest";

import { getImageWidths } from "./getImageWidths.js";

const config = { deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], imageSizes: [16, 32, 48, 64, 96, 128, 256, 384] };

describe("getImageWidths", () => {
    it("starts at the smallest device width for images spanning the viewport", () => {
        expect(getImageWidths(config, "100vw")).toEqual([640, 750, 828, 1080, 1200, 1920, 2048, 3840]);
    });

    it("starts at the smallest viewport share of the sizes", () => {
        expect(getImageWidths(config, "(min-width: 900px) 33vw, 50vw")).toEqual([256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]);
    });

    it("uses all widths for sizes without viewport units", () => {
        expect(getImageWidths(config, "300px")).toEqual([16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]);
    });
});
