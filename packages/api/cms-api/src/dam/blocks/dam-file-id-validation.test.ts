import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { PixelImageBlock } from "./pixel-image.block.js";
import { SvgImageBlock } from "./svg-image.block.js";

const blocks = [
    {
        name: "PixelImageBlock",
        createInput: (damFileId?: string | null) => PixelImageBlock.blockInputFactory({ damFileId, cropArea: null } as never),
    },
    { name: "SvgImageBlock", createInput: (damFileId?: string | null) => SvgImageBlock.blockInputFactory({ damFileId } as never) },
];

describe.each(blocks)("$name damFileId validation", ({ createInput }) => {
    it("should accept a UUID", async () => {
        const errors = await validate(createInput("a3c5e8f2-1b4d-4e6a-9c7b-2d8f0e1a3b5c"));

        expect(errors).toHaveLength(0);
    });

    it("should accept null", async () => {
        const errors = await validate(createInput(null));

        expect(errors).toHaveLength(0);
    });

    it("should reject a missing damFileId", async () => {
        const errors = await validate(createInput(undefined));

        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({ property: "damFileId" });
    });

    it.each(["not-a-uuid", ""])("should reject %j", async (damFileId) => {
        const errors = await validate(createInput(damFileId));

        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({ property: "damFileId", constraints: { isUuid: expect.any(String) } });
    });
});
