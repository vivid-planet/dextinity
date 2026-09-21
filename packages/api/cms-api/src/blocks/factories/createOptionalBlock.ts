import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, ValidateNested } from "class-validator";

import {
    Block,
    BlockContext,
    BlockData,
    BlockDataInterface,
    BlockInput,
    BlockInputInterface,
    blockInputToData,
    ChildBlockInfo,
    createBlock,
    ExtractBlockInput,
    isBlockDataInterface,
    isBlockInputInterface,
    SimpleBlockInputInterface,
    TraversableTransformBlockResponse,
} from "../block";
import { BlockField } from "../decorators/field";
import { BlockFactoryNameOrOptions } from "./types";
import { withDefaultDescription } from "./withDefaultDescription";

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

    return createBlock(
        BlockOptional,
        BlockOptionalInput,
        withDefaultDescription(nameOrOptions, `An optional ${block.name} block. Its content is only used while it is enabled.`),
    );
}
