import { Type } from "class-transformer";
import { IsString, validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { IsNullable } from "../common/validators/is-nullable.js";
import { BlockData, BlockInput, blockInputToData, createBlock, transformToBlockSave } from "./block.js";
import { BlockField } from "./decorators/field.js";

class NestedItem extends BlockData {
    @BlockField({ type: "string", nullable: true })
    caption: string | null;

    @BlockField()
    title: string;
}

class NullableFieldsBlockData extends BlockData {
    @BlockField({ type: "string", nullable: true })
    headline: string | null;

    @BlockField()
    text: string;

    @BlockField(NestedItem)
    @Type(() => NestedItem)
    items: NestedItem[];
}

class NullableFieldsBlockInput extends BlockInput {
    @IsNullable()
    @IsString()
    @BlockField({ type: "string", nullable: true })
    headline: string | null;

    @IsString()
    @BlockField()
    text: string;

    transformToBlockData(): NullableFieldsBlockData {
        return blockInputToData(NullableFieldsBlockData, this);
    }
}

const NullableFieldsBlock = createBlock(NullableFieldsBlockData, NullableFieldsBlockInput, "NullableFields");

describe("nullable block fields", () => {
    it("should set missing nullable fields to null when loading block data", () => {
        const data = NullableFieldsBlock.blockDataFactory({ text: "text", items: [{ title: "item" }] });

        expect(transformToBlockSave(data)).toEqual({ headline: null, text: "text", items: [{ caption: null, title: "item" }] });
    });

    it("should keep the values of nullable fields", () => {
        const data = NullableFieldsBlock.blockDataFactory({ headline: "headline", text: "text", items: [] });

        expect(transformToBlockSave(data)).toMatchObject({ headline: "headline" });
    });

    it("should leave missing non-nullable fields untouched", () => {
        const data = NullableFieldsBlock.blockDataFactory({ items: [] });

        expect(transformToBlockSave(data)).not.toHaveProperty("text");
    });

    it("should accept null for a nullable field in the block input", async () => {
        const errors = await validate(NullableFieldsBlock.blockInputFactory({ headline: null, text: "text" }));

        expect(errors).toHaveLength(0);
    });

    it("should reject a missing nullable field in the block input", async () => {
        const errors = await validate(NullableFieldsBlock.blockInputFactory({ text: "text" } as never));

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe("headline");
    });
});
