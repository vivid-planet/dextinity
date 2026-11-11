import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { PixelImageBlock } from "./pixel-image.block";
import { SvgImageBlock } from "./svg-image.block";

describe.each([
    ["PixelImageBlock", PixelImageBlock],
    ["SvgImageBlock", SvgImageBlock],
])("%s damFileId validation", (_, block) => {
    it("should accept a UUID", async () => {
        const errors = await validate(block.blockInputFactory({ damFileId: "a3c5e8f2-1b4d-4e6a-9c7b-2d8f0e1a3b5c" }));

        expect(errors).toHaveLength(0);
    });

    it("should accept a missing damFileId", async () => {
        const errors = await validate(block.blockInputFactory({}));

        expect(errors).toHaveLength(0);
    });

    it.each(["not-a-uuid", ""])("should reject %j", async (damFileId) => {
        const errors = await validate(block.blockInputFactory({ damFileId }));

        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({ property: "damFileId", constraints: { isUuid: expect.any(String) } });
    });

    it("should reject null", async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errors = await validate(block.blockInputFactory({ damFileId: null } as any));

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe("damFileId");
    });
});

describe("PixelImageBlock cropArea validation", () => {
    it("should accept a missing cropArea", async () => {
        const errors = await validate(PixelImageBlock.blockInputFactory({ damFileId: "a3c5e8f2-1b4d-4e6a-9c7b-2d8f0e1a3b5c" }));

        expect(errors).toHaveLength(0);
    });

    it("should reject null", async () => {
        const errors = await validate(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            PixelImageBlock.blockInputFactory({ damFileId: "a3c5e8f2-1b4d-4e6a-9c7b-2d8f0e1a3b5c", cropArea: null } as any),
        );

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe("cropArea");
    });
});
