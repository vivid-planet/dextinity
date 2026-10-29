import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, ValidateNested } from "class-validator";

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

export interface OptionalBlockInputInterface<DecoratedBlockInput extends BlockInputInterface> extends SimpleBlockInputInterface {
    block?: DecoratedBlockInput;
    visible: boolean;
}

export function createOptionalBlock<DecoratedBlock extends Block>(
    block: DecoratedBlock,
    nameOrOptions: BlockFactoryNameOrOptions = `Optional${block.name}`,
): Block<BlockDataInterface, OptionalBlockInputInterface<ExtractBlockInput<DecoratedBlock>>> {
    class BlockOptional extends BlockData {
        @BlockField({ type: "block", block, nullable: true })
        @Transform(({ value }) => (value ? (isBlockDataInterface(value) ? value : block.blockDataFactory(value)) : undefined), { toClassOnly: true })
        block?: BlockDataInterface;

        @BlockField()
        visible: boolean;

        async transformToPlain({ includeInvisibleContent }: BlockContext): Promise<TraversableTransformBlockResponse> {
            return {
                block: (includeInvisibleContent || this.visible) && this.block ? this.block : null,
                visible: this.visible,
            };
        }

        childBlocksInfo(): ChildBlockInfo[] {
            const ret: ChildBlockInfo[] = [];
            if (this.block) {
                ret.push({
                    visible: this.visible,
                    relJsonPath: ["block"],
                    block: this.block,
                    name: block.name,
                });
            }
            return ret;
        }
    }

    class BlockOptionalInput extends BlockInput {
        @BlockField({ type: "block", block, nullable: true })
        @Transform(({ value }) => (value ? (isBlockInputInterface(value) ? value : block.blockInputFactory(value)) : undefined), {
            toClassOnly: true,
        })
        @ValidateNested()
        @IsOptional()
        block?: ExtractBlockInput<DecoratedBlock>;

        @IsBoolean()
        @BlockField()
        visible: boolean;

        transformToBlockData(): BlockOptional {
            return blockInputToData(BlockOptional, this);
        }
    }

    return createBlock(BlockOptional, BlockOptionalInput, nameOrOptions);
}
