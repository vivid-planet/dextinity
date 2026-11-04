import { describe, expect, it } from "vitest";

import { getImageWidths } from "./getImageWidths";

const config = { deviceSizes: [640, 1080, 1920], imageSizes: [64, 256, 384] };

describe("getImageWidths", () => {
    it("uses the device sizes without sizes", () => {
        expect(getImageWidths(config, undefined)).toEqual([640, 1080, 1920]);
    });

    it("leaves out the widths that are too small for the smallest device", () => {
        expect(getImageWidths(config, "(min-width: 900px) 33vw, 50vw")).toEqual([256, 384, 640, 1080, 1920]);
    });

    it("uses all widths for absolute sizes", () => {
        expect(getImageWidths(config, "300px")).toEqual([64, 256, 384, 640, 1080, 1920]);
    });
});
