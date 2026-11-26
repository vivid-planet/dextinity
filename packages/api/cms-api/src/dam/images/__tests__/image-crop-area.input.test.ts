import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { FocalPoint } from "../../../file-utils/focal-point.enum";
import { ImageCropAreaInput } from "../dto/image-crop-area.input";

function makeInput(cropArea: Partial<ImageCropAreaInput>): ImageCropAreaInput {
    return Object.assign(new ImageCropAreaInput(), cropArea);
}

async function validatedProperties(cropArea: Partial<ImageCropAreaInput>): Promise<string[]> {
    const errors = await validate(makeInput(cropArea));

    return errors.map((error) => error.property);
}

describe("ImageCropAreaInput", () => {
    it("should accept a SMART focal point without dimensions", async () => {
        expect(await validatedProperties({ focalPoint: FocalPoint.SMART })).toEqual([]);
    });

    it("should accept a manual focal point with dimensions", async () => {
        expect(await validatedProperties({ focalPoint: FocalPoint.CENTER, width: 50, height: 25, x: 10, y: 5 })).toEqual([]);
    });

    it("should reject a manual focal point without dimensions", async () => {
        expect(await validatedProperties({ focalPoint: FocalPoint.CENTER })).toEqual(["width", "height", "x", "y"]);
    });

    it("should reject a manual focal point with zero dimensions", async () => {
        expect(await validatedProperties({ focalPoint: FocalPoint.CENTER, width: 0, height: 0, x: 0, y: 0 })).toEqual(["width", "height"]);
    });

    it("should reject dimensions above 100 percent", async () => {
        expect(await validatedProperties({ focalPoint: FocalPoint.CENTER, width: 101, height: 50, x: 0, y: 0 })).toEqual(["width"]);
    });
});
