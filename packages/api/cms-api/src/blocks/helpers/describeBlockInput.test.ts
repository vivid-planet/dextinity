import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";
import { describe, expect, it } from "vitest";

import { BlockData, BlockDataInterface, BlockInput, blockInputToData, createBlock } from "../block";
import { BlockField } from "../decorators/field";
import { describeBlockInput } from "./describeBlockInput";

enum Size {
    small = "small",
    large = "large",
}

class GalleryBlockData extends BlockData {}

class GalleryBlockInput extends BlockInput {
    @IsString()
    @IsOptional()
    @BlockField({ nullable: true })
    title?: string;

    @IsInt({ each: true })
    @BlockField({ type: "number", array: true })
    heights: number[];

    @IsEnum(Size, { each: true })
    @BlockField({ type: "enum", enum: Size, array: true })
    sizes: Size[];

    transformToBlockData(): BlockDataInterface {
        return blockInputToData(GalleryBlockData, this);
    }
}

const GalleryBlock = createBlock(GalleryBlockData, GalleryBlockInput, "DescribeGallery");

describe("describeBlockInput", () => {
    it("should describe the fields of a block, including nullable and list fields", () => {
        expect(describeBlockInput(GalleryBlock)).toBe(
            "a DescribeGallery block with the fields title (a string or null), heights (a list of numbers), sizes (a list of: small, large)",
        );
    });
});
