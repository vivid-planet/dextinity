import { plainToInstance, Transform, Type } from "class-transformer";
import { IsEnum, IsInt, IsString, registerDecorator, validate, ValidateNested } from "class-validator";
import { describe, expect, it } from "vitest";

import { BlockData, BlockDataInterface, BlockInput, BlockInputInterface, blockInputToData, createBlock, ExtractBlockInput } from "../block";
import { ChildBlock } from "../decorators/child-block";
import { ChildBlockInput } from "../decorators/child-block-input";
import { BlockField } from "../decorators/field";
import { createBlocksBlock } from "../factories/createBlocksBlock";
import { createOneOfBlock } from "../factories/createOneOfBlock";
import { composeBlocks } from "../helpers/composeBlocks";
import { getValidationErrorDetails } from "./validation-error-details";

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

const SpaceBlock = createBlock(SpaceBlockData, SpaceBlockInput, "DetailsSpace");

class TeaserBlockData extends BlockData {
    @BlockField()
    title: string;

    @ChildBlock(SpaceBlock)
    space: BlockDataInterface;
}

function FailsWithoutMessage(): PropertyDecorator {
    return (target, propertyName) => {
        registerDecorator({
            name: "failsWithoutMessage",
            target: target.constructor,
            propertyName: propertyName as string,
            validator: { validate: () => false },
        });
    };
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

const TeaserBlock = createBlock(TeaserBlockData, TeaserBlockInput, "DetailsTeaser");

class CheckedTeaserBlockInput extends TeaserBlockInput {
    @FailsWithoutMessage()
    @BlockField()
    declare title: string;
}

const CheckedTeaserBlock = createBlock(TeaserBlockData, CheckedTeaserBlockInput, "DetailsCheckedTeaser");

// The additional @ValidateNested() validates the child block a second time, so class-validator reports its errors twice.
class DoublyValidatedTeaserBlockInput extends TeaserBlockInput {
    @ValidateNested()
    @ChildBlockInput(SpaceBlock)
    declare space: ExtractBlockInput<typeof SpaceBlock>;
}

const DoublyValidatedTeaserBlock = createBlock(TeaserBlockData, DoublyValidatedTeaserBlockInput, "DetailsDoublyValidatedTeaser");

const ComposedBlock = composeBlocks({ blocks: { space: SpaceBlock, teaser: TeaserBlock } }, "DetailsComposed");

const MediaBlock = createOneOfBlock({ supportedBlocks: { space: SpaceBlock, teaser: TeaserBlock }, allowEmpty: false }, "DetailsMedia");

const ContentBlock = createBlocksBlock(
    {
        supportedBlocks: {
            space: SpaceBlock,
            teaser: TeaserBlock,
            checkedTeaser: CheckedTeaserBlock,
            doublyValidatedTeaser: DoublyValidatedTeaserBlock,
            media: MediaBlock,
            composed: ComposedBlock,
        },
    },
    "DetailsContent",
);

class PageInput {
    @Transform(({ value }) => ContentBlock.blockInputFactory(value), { toClassOnly: true })
    @ValidateNested()
    content: BlockInputInterface;
}

const validSpace = { height: 10, size: "small" };

async function getDetails(blocks: unknown) {
    const input = plainToInstance(PageInput, { content: { blocks } });
    const errors = await validate(input, { whitelist: true, forbidNonWhitelisted: true, forbidUnknownValues: false });

    return getValidationErrorDetails(errors);
}

function item(type: string, props: unknown) {
    return { key: "a1", visible: true, type, props };
}

describe("getValidationErrorDetails", () => {
    it("should report the value of an invalid field with the block that holds it", async () => {
        await expect(getDetails([item("space", validSpace), item("space", { ...validSpace, height: "large" })])).resolves.toEqual([
            {
                path: "content.blocks[1].props.height",
                blockName: "DetailsSpace",
                blockKey: "a1",
                blockType: "space",
                message: 'Field "height" of block DetailsSpace (key "a1"): must be an integer number, but is "large".',
            },
        ]);
    });

    it("should name the key only for the block the entry holds directly", async () => {
        await expect(getDetails([item("teaser", { title: "Title", space: { ...validSpace, height: 1.5 } })])).resolves.toEqual([
            {
                path: "content.blocks[0].props.space.height",
                blockName: "DetailsSpace",
                blockKey: "a1",
                blockType: "teaser",
                message: 'Field "height" of block DetailsSpace: must be an integer number, but is 1.5.',
            },
        ]);
    });

    it("should list the allowed fields for an unknown field", async () => {
        const [detail] = await getDetails([item("space", { ...validSpace, foo: 1 })]);

        expect(detail.message).toBe('Field "foo" of block DetailsSpace (key "a1"): unknown field. Allowed fields: height, size.');
    });

    it("should list the allowed values for an invalid enum value", async () => {
        const [detail] = await getDetails([item("space", { ...validSpace, size: "medium" })]);

        expect(detail.message).toBe('Field "size" of block DetailsSpace (key "a1"): invalid value "medium". Allowed values: small, large.');
    });

    it("should list the allowed values for a missing enum value", async () => {
        const [detail] = await getDetails([item("space", { height: 10 })]);

        expect(detail.message).toBe('Field "size" of block DetailsSpace (key "a1"): is missing. Allowed values: small, large.');
    });

    it("should list the allowed types for an unknown block type", async () => {
        await expect(getDetails([item("spacer", {})])).resolves.toEqual([
            {
                path: "content.blocks[0].type",
                blockName: "DetailsContent",
                blockKey: "a1",
                blockType: "spacer",
                message:
                    'Field "blocks[0].type" of block DetailsContent: unknown block type "spacer". Allowed types: space, teaser, checkedTeaser, doublyValidatedTeaser, media, composed.',
            },
        ]);
    });

    it("should describe the fields of a missing block", async () => {
        const [detail] = await getDetails([item("teaser", { title: "Title" })]);

        expect(detail).toMatchObject({ path: "content.blocks[0].props.space", blockName: "DetailsTeaser" });
        expect(detail.message).toBe(
            'Field "space" of block DetailsTeaser (key "a1"): is missing. Expected a DetailsSpace block with the fields height (a number), size (one of: small, large).',
        );
    });

    it("should explain an empty one-of block", async () => {
        const [detail] = await getDetails([item("media", { attachedBlocks: [] })]);

        expect(detail.message).toBe(
            'Field "attachedBlocks" of block DetailsMedia (key "a1"): must not be empty. A one-of block lists its variants in "attachedBlocks" as { "type", "props" } and names the active one in "activeType".',
        );
    });

    it("should report the type of an entry in a one-of block", async () => {
        await expect(
            getDetails([item("media", { attachedBlocks: [{ type: "space", props: { ...validSpace, height: "x" } }], activeType: "space" })]),
        ).resolves.toEqual([
            {
                path: "content.blocks[0].props.attachedBlocks[0].props.height",
                blockName: "DetailsSpace",
                blockType: "space",
                message: 'Field "height" of block DetailsSpace: must be an integer number, but is "x".',
            },
        ]);
    });

    it("should report a list that isn't an array", async () => {
        await expect(getDetails("abc")).resolves.toEqual([
            {
                path: "content.blocks",
                blockName: "DetailsContent",
                message: 'Field "blocks" of block DetailsContent: must be a list, but is "abc".',
            },
        ]);
    });

    it("should report a list item that isn't an object", async () => {
        const [detail] = await getDetails([item("space", validSpace), []]);

        expect(detail).toMatchObject({ path: "content.blocks", message: 'Field "blocks" of block DetailsContent: each item must be an object.' });
    });

    it("should name the check of a validator without a message", async () => {
        const [detail] = await getDetails([item("checkedTeaser", { title: "Title", space: validSpace })]);

        expect(detail.message).toBe(
            'Field "title" of block DetailsCheckedTeaser (key "a1"): must pass the "failsWithoutMessage" check, but is "Title".',
        );
    });

    it("should report the child blocks of a composed block as its fields", async () => {
        const details = await getDetails([item("composed", { space: { ...validSpace, height: "x" } })]);

        expect(details).toEqual([
            {
                path: "content.blocks[0].props.space.height",
                blockName: "DetailsSpace",
                blockKey: "a1",
                blockType: "composed",
                message: 'Field "height" of block DetailsSpace: must be an integer number, but is "x".',
            },
            {
                path: "content.blocks[0].props.teaser",
                blockName: "DetailsComposed",
                blockKey: "a1",
                blockType: "composed",
                message:
                    'Field "teaser" of block DetailsComposed (key "a1"): is missing. Expected a DetailsTeaser block with the fields title (a string), space (a DetailsSpace block).',
            },
        ]);
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

            @IsString()
            id: unknown;
        }

        const input = plainToInstance(ListInput, { sort: [{ direction: 1 }], id: BigInt(1), foo: 1 });
        const details = getValidationErrorDetails(await validate(input, { whitelist: true, forbidNonWhitelisted: true }));

        expect(details).toHaveLength(3);
        expect(details).toEqual(
            expect.arrayContaining([
                { path: "sort[0].direction", message: 'Field "sort[0].direction": must be a string, but is 1.' },
                { path: "id", message: 'Field "id": must be a string, but is 1.' },
                { path: "foo", message: 'Field "foo": unknown field.' },
            ]),
        );
    });

    it("should report an error that class-validator reports twice only once", async () => {
        const details = await getDetails([item("doublyValidatedTeaser", { title: "Title", space: { ...validSpace, height: "x" } })]);

        expect(details).toHaveLength(1);
        expect(details[0].path).toBe("content.blocks[0].props.space.height");
    });
});
