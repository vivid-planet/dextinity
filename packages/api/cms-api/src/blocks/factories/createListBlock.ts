import { type ClassConstructor, plainToInstance, Transform, Type } from "class-transformer";
import { Allow, IsBoolean, IsString, ValidateNested } from "class-validator";

import {
    type Block,
    type BlockContext,
    BlockData,
    type BlockDataInterface,
    BlockInput,
    type BlockInputInterface,
    blockInputToData,
    type ChildBlockInfo,
    createBlock,
    type ExtractBlockInput,
    isBlockDataInterface,
    isBlockInputInterface,
    type SimpleBlockInputInterface,
    type TraversableTransformBlockResponse,
} from "../block.js";
import { BlockField } from "../decorators/field.js";
import type { BlockFactoryNameOrOptions } from "./types.js";

interface ListBlockItemDataInterface extends BlockData {
    key: string;
    visible: boolean;
    props: BlockDataInterface;
}

export function BaseListBlockItemData<B extends Block>(block: B): ClassConstructor<ListBlockItemDataInterface> {
    class ListBlockItemData extends BlockData {
        @BlockField()
        key: string;

        @BlockField()
        visible: boolean;

        @Transform(({ value }) => (isBlockDataInterface(value) ? value : block.blockDataFactory(value)), { toClassOnly: true })
        @BlockField(block)
        props: BlockDataInterface;

        async transformToPlain({ includeInvisibleContent }: BlockContext): Promise<TraversableTransformBlockResponse> {
            const { key, visible, props, ...additionalFields } = this;

            return {
                key,
                visible,
                props: includeInvisibleContent || visible ? this.props : {},
                ...additionalFields,
            };
        }
    }

    return ListBlockItemData;
}

interface ListBlockItemInputInterface<Input extends BlockInputInterface> extends BlockInput {
    key: string;
    visible: boolean;
    props: Input;
    transformToBlockData(): ListBlockItemDataInterface;
}

export function BaseListBlockItemInput<B extends Block>(
    block: B,
    ListBlockItemData: ClassConstructor<ListBlockItemDataInterface>,
): ClassConstructor<ListBlockItemInputInterface<ExtractBlockInput<B>>> {
    class ListBlockItemInput extends BlockInput {
        @Allow()
        @IsString()
        @BlockField()
        key: string;

        @IsBoolean()
        @BlockField()
        visible: boolean;

        @Transform(
            ({ value }) => {
                return isBlockInputInterface(value) ? value : block.blockInputFactory(value);
            },
            { toClassOnly: true },
        )
        @ValidateNested()
        @BlockField(block)
        props: ExtractBlockInput<B>;

        transformToBlockData(): ListBlockItemDataInterface {
            return blockInputToData(ListBlockItemData, this);
        }
    }

    return ListBlockItemInput;
}

interface ListBlockInputInterface<B extends BlockInputInterface> extends SimpleBlockInputInterface {
    blocks: Array<
        {
            key: string;
            visible: boolean;
            props: B;
        } & SimpleBlockInputInterface
    >;
}

interface Options<B extends Block> {
    block: B;
    ListBlockItemData?: ClassConstructor<ListBlockItemDataInterface>;
    ListBlockItemInput?: ClassConstructor<ListBlockItemInputInterface<ExtractBlockInput<B>>>;
}

export function createListBlock<B extends Block>(
    { block, ListBlockItemData = BaseListBlockItemData(block), ListBlockItemInput = BaseListBlockItemInput(block, ListBlockItemData) }: Options<B>,
    name: BlockFactoryNameOrOptions,
): Block<BlockDataInterface, ListBlockInputInterface<ExtractBlockInput<B>>> {
    if (!block) {
        throw new Error("Provided 'block' is undefined. This is most likely due to a circular import");
    }

    class ListBlockData extends BlockData {
        @Type(() => ListBlockItemData)
        @BlockField(ListBlockItemData)
        blocks: ListBlockItemDataInterface[];

        async transformToPlain({ includeInvisibleContent }: BlockContext): Promise<TraversableTransformBlockResponse> {
            return {
                blocks: includeInvisibleContent ? this.blocks : this.blocks.filter((c) => c.visible),
            };
        }

        childBlocksInfo(): ChildBlockInfo[] {
            return this.blocks.map((childBlock, index) => ({
                visible: childBlock.visible,
                relJsonPath: ["blocks", index, "props"],
                block: childBlock.props,
                name: block.name,
            }));
        }
    }

    class ListBlockInput extends BlockInput {
        @Type(() => ListBlockItemInput)
        @ValidateNested({ each: true })
        @BlockField(ListBlockItemInput)
        blocks: ListBlockItemInputInterface<ExtractBlockInput<B>>[];

        transformToBlockData(): ListBlockData {
            return plainToInstance(ListBlockData, {
                ...this,
                blocks: this.blocks.map((block) => block.transformToBlockData()),
            });
        }
    }

    return createBlock(ListBlockData, ListBlockInput, name);
}
