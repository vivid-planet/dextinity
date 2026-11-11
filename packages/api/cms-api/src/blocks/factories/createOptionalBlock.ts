import { Transform } from "class-transformer";
import { IsBoolean, ValidateNested } from "class-validator";

import { IsNullable } from "../../common/validators/is-nullable.js";
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
import { withDefaultDescription } from "./withDefaultDescription.js";

export interface OptionalBlockInputInterface<DecoratedBlockInput extends BlockInputInterface> extends SimpleBlockInputInterface {
    block: DecoratedBlockInput | null;
    visible: boolean;
}

export function createOptionalBlock<DecoratedBlock extends Block>(
    block: DecoratedBlock,
    nameOrOptions: BlockFactoryNameOrOptions = `Optional${block.name}`,
): Block<BlockDataInterface, OptionalBlockInputInterface<ExtractBlockInput<DecoratedBlock>>> {
    class BlockOptional extends BlockData {
        @BlockField({ type: "block", block, nullable: true })
        @Transform(({ value }) => (value ? (isBlockDataInterface(value) ? value : block.blockDataFactory(value)) : null), { toClassOnly: true })
        block: BlockDataInterface | null;

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
        @Transform(({ value }) => (value ? (isBlockInputInterface(value) ? value : block.blockInputFactory(value)) : value), {
            toClassOnly: true,
        })
        @ValidateNested()
        @IsNullable()
        block: ExtractBlockInput<DecoratedBlock> | null;

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
        withDefaultDescription(
            nameOrOptions,
            'A block that can be turned off. `block` holds the props of the wrapped block, `visible` `false` hides it on the site. An empty block is `{"block":null,"visible":false}`.',
        ),
    );
}
