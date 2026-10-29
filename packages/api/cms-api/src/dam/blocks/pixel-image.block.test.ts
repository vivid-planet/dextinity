import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { FocalPoint } from "../../file-utils/focal-point.enum";
import { PixelImageBlock } from "./pixel-image.block";

const damFileId = "a3c5e8f2-1b4d-4e6a-9c7b-2d8f0e1a3b5c";

describe("PixelImageBlock cropArea validation", () => {
    it("should accept a crop area", async () => {
        const errors = await validate(PixelImageBlock.blockInputFactory({ damFileId, cropArea: { focalPoint: FocalPoint.SMART } }));

        expect(errors).toHaveLength(0);
    });

    it("should accept a missing crop area", async () => {
        const errors = await validate(PixelImageBlock.blockInputFactory({ damFileId }));

        expect(errors).toHaveLength(0);
    });

    it("should reject a null crop area", async () => {
        const errors = await validate(PixelImageBlock.blockInputFactory({ damFileId, cropArea: null as unknown as undefined }));

        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({ property: "cropArea" });
    });
});
