import type { Type } from "@nestjs/common";
import { plainToInstance, Transform } from "class-transformer";
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
    type ExtractBlockInputFactoryProps,
    isBlockDataInterface,
    isBlockInputInterface,
    type SimpleBlockInputInterface,
    type TraversableTransformBlockResponse,
} from "../block.js";
import { BlockField } from "../decorators/field.js";
import type { BlockFactoryNameOrOptions } from "./types.js";

interface BlocksBlockItemDataInterface extends BlockData {
    key: string;
    visible: boolean;
    type: string;
    props: BlockDataInterface;
}

export function BaseBlocksBlockItemData<BlockMap extends BaseBlockMap>(supportedBlocks: BlockMap): Type<BlocksBlockItemDataInterface> {
    class BlocksBlockItemData extends BlockData {
        @BlockField()
        key: string;

        @BlockField()
        visible: boolean;

        @BlockField()
        type: string;

        @Transform(
            ({ value, obj }) => {
                const blockType = obj.type as string;
                const block = supportedBlocks[blockType];

                if (!block) {
                    throw new Error(`unknown type ${blockType}`);
                }

                return isBlockDataInterface(value) ? value : block.blockDataFactory(value);
            },
            { toClassOnly: true },
        )
        @BlockField({ kind: "oneOfBlocks", blocks: supportedBlocks })
        props: BlockDataInterface;

        async transformToPlain({ includeInvisibleContent }: BlockContext): Promise<TraversableTransformBlockResponse> {
            const { key, visible, type, props, ...additionalFields } = this;

            return {
                key,
                visible,
                type,
                // admin must see the subblock, site must only see sublock when it is not hidden, all otherr cases do not get the subblock
                props: includeInvisibleContent || this.visible ? this.props : {},
                ...additionalFields,
            };
        }
    }

    return BlocksBlockItemData;
}

interface BlocksBlockItemInputInterface extends BlockInput {
    key: string;
    visible: boolean;
    type: string;
    props: BlockInputInterface;
    transformToBlockData(): BlocksBlockItemDataInterface;
}

export function BaseBlocksBlockItemInput<BlockMap extends BaseBlockMap>(
    supportedBlocks: BlockMap,
    BlocksBlockItemData: Type<BlocksBlockItemDataInterface>,
): Type<BlocksBlockItemInputInterface> {
    class BlocksBlockItemInput extends BlockInput {
        @Allow()
        @IsString()
        @BlockField()
        key: string;

        @IsBoolean()
        @BlockField()
        visible: boolean;

        @IsString()
        @BlockField()
        type: string;

        @Transform(
            ({ value, obj }) => {
                const blockType = obj.type as string;
                const block = supportedBlocks[blockType];

                if (!block) {
                    throw new Error(`unknown type ${blockType}`);
                }

                return isBlockInputInterface(value) ? value : block.blockInputFactory(value);
            },
            { toClassOnly: true },
        )
        @ValidateNested()
        @BlockField({ kind: "oneOfBlocks", blocks: supportedBlocks })
        props: BlockInputInterface;

        transformToBlockData(): BlocksBlockItemDataInterface {
            return blockInputToData(BlocksBlockItemData, this);
        }
    }

    return BlocksBlockItemInput;
}

type BaseBlockMap = Record<string, Block>;

interface Options<BlockMap extends BaseBlockMap> {
    supportedBlocks: BlockMap;
    BlocksBlockItemData?: Type<BlocksBlockItemDataInterface>;
    BlocksBlockItemInput?: Type<BlocksBlockItemInputInterface>;
}

export interface BlocksBlockInputInterface<BlockMap extends BaseBlockMap> extends SimpleBlockInputInterface {
    blocks: SupportedBlocksInputInterfaces<BlockMap>[];
}

type SupportedBlocksInputInterfaces<BlockMap extends BaseBlockMap> = {
    [Typename in keyof BlockMap]: SimpleBlockInputInterface & {
        key: string;
        visible: boolean;
        type: Typename;
        props: ExtractBlockInput<BlockMap[Typename]>;
    };
}[keyof BlockMap]; // https://effectivetypescript.com/2020/05/12/unionize-objectify/

export function createBlocksBlock<BlockMap extends BaseBlockMap>(
    {
        supportedBlocks,
        BlocksBlockItemData = BaseBlocksBlockItemData(supportedBlocks),
        BlocksBlockItemInput = BaseBlocksBlockItemInput(supportedBlocks, BlocksBlockItemData),
    }: Options<BlockMap>,
    nameOrOptions: BlockFactoryNameOrOptions,
): Block<BlockDataInterface, BlocksBlockInputInterface<BlockMap>> {
    if (Object.keys(supportedBlocks).length === 0) {
        throw new Error("Blocks block with no supported block is not allowed. Please specify at least two supported blocks.");
    }

    if (Object.keys(supportedBlocks).length === 1) {
        throw new Error("Blocks block with a single block is not allowed. Please use a list block (createListBlock()) instead.");
    }

    for (const block in supportedBlocks) {
        if (!supportedBlocks[block]) {
            throw new Error(`Supported block '${block}' is undefined. This is most likely due to a circular import`);
        }
    }

    class BlocksBlockData extends BlockData {
        @Transform(({ value }: { value: BlocksBlockItemDataInterface[] }) =>
            value
                .filter((item) => {
                    if (!supportedBlocks[item.type]) {
                        console.warn(`Unknown block type "${item.type}"`);
                        return false;
                    }

                    return true;
                })
                .map((item) => plainToInstance(BlocksBlockItemData, item)),
        )
        @BlockField(BlocksBlockItemData)
        blocks: BlocksBlockItemDataInterface[];

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
                name: supportedBlocks[childBlock.type].name,
            }));
        }
    }

    class BlocksBlockInput extends BlockInput {
        @Transform(({ value }: { value: BlocksBlockItemInputInterface[] }) =>
            value
                .filter((item) => {
                    if (!supportedBlocks[item.type]) {
                        console.warn(`Unknown block type "${item.type}"`);
                        return false;
                    }

                    return true;
                })
                .map((item) => plainToInstance(BlocksBlockItemInput, item)),
        )
        @ValidateNested({ each: true })
        @BlockField(BlocksBlockItemInput)
        blocks: SupportedBlocksInputInterfaces<BlockMap>[];

        transformToBlockData(): BlocksBlockData {
            return plainToInstance(BlocksBlockData, {
                blocks: this.blocks.map((block) => block.transformToBlockData()),
            });
        }
    }

    return createBlock(BlocksBlockData, BlocksBlockInput, nameOrOptions);
}

// internal helper
type ExtractBlockMap<T> = T extends Block<BlockDataInterface, BlocksBlockInputInterface<infer BlockMap>> ? BlockMap : never;

// Useful for creating fixtures
export type BlocksBlockFixturesGeneratorMap<T extends Block> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Typename in keyof ExtractBlockMap<T>]: (...args: any[]) => ExtractBlockInputFactoryProps<ExtractBlockMap<T>[Typename]>;
};
