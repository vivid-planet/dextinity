import { plainToInstance, Transform, Type } from "class-transformer";
import { IsEnum, IsInt, IsString, validate, ValidateNested } from "class-validator";
import { describe, expect, it } from "vitest";

import { BlockData, BlockDataInterface, BlockInput, BlockInputInterface, blockInputToData, createBlock, ExtractBlockInput } from "../../blocks/block";
import { ChildBlock } from "../../blocks/decorators/child-block";
import { ChildBlockInput } from "../../blocks/decorators/child-block-input";
import { BlockField } from "../../blocks/decorators/field";
import { createBlocksBlock } from "../../blocks/factories/createBlocksBlock";
import { createOneOfBlock } from "../../blocks/factories/createOneOfBlock";
import { composeBlocks } from "../../blocks/helpers/composeBlocks";
import { formatValidationErrors } from "./format-validation-errors";

enum SpaceSize {
    small = "small",
    large = "large",
}

class SpaceBlockData extends BlockData {
    @BlockField()
    height: number;

    @BlockField({ type: "enum", enum: SpaceSize })
    size: SpaceSize;
}

class SpaceBlockInput extends BlockInput {
    @IsInt()
    @BlockField()
    height: number;

    @IsEnum(SpaceSize)
    @BlockField({ type: "enum", enum: SpaceSize })
    size: SpaceSize;

    transformToBlockData(): BlockDataInterface {
        return blockInputToData(SpaceBlockData, this);
    }
}

const SpaceBlock = createBlock(SpaceBlockData, SpaceBlockInput, "FormatSpace");

class TeaserBlockData extends BlockData {
    @BlockField()
    title: string;

    @ChildBlock(SpaceBlock)
    space: BlockDataInterface;
}

class TeaserBlockInput extends BlockInput {
    @IsString()
    @BlockField()
    title: string;

    @ChildBlockInput(SpaceBlock)
    space: ExtractBlockInput<typeof SpaceBlock>;

    transformToBlockData(): BlockDataInterface {
        return blockInputToData(TeaserBlockData, this);
    }
}

const TeaserBlock = createBlock(TeaserBlockData, TeaserBlockInput, "FormatTeaser");

// The additional @ValidateNested() validates the child block a second time, so class-validator reports its errors twice.
class DoublyValidatedTeaserBlockInput extends TeaserBlockInput {
    @ValidateNested()
    @ChildBlockInput(SpaceBlock)
    declare space: ExtractBlockInput<typeof SpaceBlock>;
}

const DoublyValidatedTeaserBlock = createBlock(TeaserBlockData, DoublyValidatedTeaserBlockInput, "FormatDoublyValidatedTeaser");

const ComposedBlock = composeBlocks({ blocks: { space: SpaceBlock, teaser: TeaserBlock } }, "FormatComposed");

const MediaBlock = createOneOfBlock({ supportedBlocks: { space: SpaceBlock, teaser: TeaserBlock }, allowEmpty: false }, "FormatMedia");

const ContentBlock = createBlocksBlock(
    {
        supportedBlocks: {
            space: SpaceBlock,
            teaser: TeaserBlock,
            doublyValidatedTeaser: DoublyValidatedTeaserBlock,
            media: MediaBlock,
            composed: ComposedBlock,
        },
    },
    "FormatContent",
);

class PageInput {
    @Transform(({ value }) => ContentBlock.blockInputFactory(value), { toClassOnly: true })
    @ValidateNested()
    content: BlockInputInterface;
}

const validSpace = { height: 10, size: "small" };

async function formatErrors(blocks: unknown) {
    const input = plainToInstance(PageInput, { content: { blocks } });

    return formatValidationErrors(await validate(input, { whitelist: true, forbidNonWhitelisted: true, forbidUnknownValues: false }));
}

function item(type: string, props: unknown) {
    return { key: "a1", visible: true, type, props };
}

describe("formatValidationErrors", () => {
    it("should report the path of an invalid field in a nested block", async () => {
        await expect(
            formatErrors([item("space", validSpace), item("teaser", { title: "Title", space: { ...validSpace, height: "large" } })]),
        ).resolves.toEqual([{ path: "content.blocks[1].props.space.height", message: "height must be an integer number" }]);
    });

    it("should report the path of an invalid field in a one-of block", async () => {
        await expect(
            formatErrors([item("media", { attachedBlocks: [{ type: "space", props: { ...validSpace, height: "x" } }], activeType: "space" })]),
        ).resolves.toEqual([{ path: "content.blocks[0].props.attachedBlocks[0].props.height", message: "height must be an integer number" }]);
    });

    it("should report a list that isn't an array only once", async () => {
        await expect(formatErrors("abc")).resolves.toEqual([{ path: "content.blocks", message: "blocks must be an array" }]);
    });

    it("should report the child blocks of a composed block by their field name", async () => {
        const errors = await formatErrors([
            item("composed", { space: { ...validSpace, height: "x" }, teaser: { title: "Title", space: validSpace } }),
        ]);

        expect(errors).toEqual([{ path: "content.blocks[0].props.space.height", message: "height must be an integer number" }]);
    });

    it("should report an error that class-validator reports twice only once", async () => {
        const errors = await formatErrors([item("doublyValidatedTeaser", { title: "Title", space: { ...validSpace, height: "x" } })]);

        expect(errors).toEqual([{ path: "content.blocks[0].props.space.height", message: "height must be an integer number" }]);
    });

    it("should report errors in an input without blocks", async () => {
        class SortInput {
            @IsString()
            direction: string;
        }

        class ListInput {
            @ValidateNested({ each: true })
            @Type(() => SortInput)
            sort: SortInput[];
        }

        const input = plainToInstance(ListInput, { sort: [{ direction: 1 }], foo: 1 });
        const errors = formatValidationErrors(await validate(input, { whitelist: true, forbidNonWhitelisted: true }));

        expect(errors).toHaveLength(2);
        expect(errors).toEqual(
            expect.arrayContaining([
                { path: "sort[0].direction", message: "direction must be a string" },
                { path: "foo", message: "property foo should not exist" },
            ]),
        );
    });
});
