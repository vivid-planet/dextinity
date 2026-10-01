import { Allow, ValidateNested } from "class-validator";

import {
    Block,
    BlockData,
    BlockDataFactory,
    BlockDataInterface,
    BlockInputFactory,
    BlockInputInterface,
    BlockMetaFieldKind,
    ChildBlockInfo,
    ExtractBlockInputFactoryProps,
<<<<<<< HEAD
    MigrateOptions,
=======
    registerBlock,
>>>>>>> main
    TransformBlockResponse,
} from "../block";
import { createAppliedMigrationsBlockDataFactoryDecorator } from "../migrations/createAppliedMigrationsBlockDataFactoryDecorator";
import { BlockDataMigrationVersion } from "../migrations/decorators/BlockDataMigrationVersion";
import type { MigrateOptions } from "../migrations/types";
import { strictBlockDataFactoryDecorator } from "./strictBlockDataFactoryDecorator";
import { strictBlockInputFactoryDecorator } from "./strictBlockInputFactoryDecorator";

type BaseBlockMap = Record<string, Block>;

interface Options<BlockMap extends BaseBlockMap> {
    blocks: BlockMap;
}

type InputFactoryProps<BlockMap extends BaseBlockMap> = {
    [Name in keyof BlockMap]: ExtractBlockInputFactoryProps<BlockMap[Name]>;
};

const MIGRATE: MigrateOptions = {
    migrations: [],
    version: 0,
}; // placeholder for future migrations

interface CompositeBlockInputInterface<BlockMap extends BaseBlockMap> extends BlockInputInterface {
    transformToBlockData(): BlockDataInterface;
    toPlain(): InputFactoryProps<BlockMap>;
}

export function composeBlocks<BlockMap extends BaseBlockMap>(
    { blocks }: Options<BlockMap>,
    name: string,
): Block<BlockDataInterface, CompositeBlockInputInterface<BlockMap>> {
    @BlockDataMigrationVersion(MIGRATE.version)
    class CompositeBlock extends BlockData implements BlockDataInterface {
        public _blockMap: Record<keyof BlockMap, BlockDataInterface>;

        public async transformToPlain(): Promise<TransformBlockResponse> {
            return Object.entries(this._blockMap).reduce((a, [key, block]) => ({ ...a, [key]: block }), {});
        }

        public transformToSave(): TransformBlockResponse {
            return Object.entries(this._blockMap).reduce((a, [key, block]) => ({ ...a, [key]: block }), {});
        }

        childBlocksInfo(): ChildBlockInfo[] {
            return Object.entries(this._blockMap).map(([key, childBlock]) => {
                return {
                    visible: true,
                    relJsonPath: [key],
                    block: childBlock,
                    name: blocks[key].name,
                };
            });
        }
    }

    class CompositeBlockInput implements CompositeBlockInputInterface<BlockMap> {
        @Allow()
        @ValidateNested({ each: true }) // @TODO: we must verify that all defined subblocks are present (they are not optional)
        public _blockMap: Map<string, BlockInputInterface | null>;

        public transformToBlockData(): CompositeBlock {
            const block = new CompositeBlock();
            block._blockMap = Array.from(this._blockMap).reduce(
                (a, [key, block]) => ({ ...a, [key]: block ? block.transformToBlockData() : null }),
                {},
            ) as Record<keyof BlockMap, BlockDataInterface>;
            return block;
        }

        public toPlain(): InputFactoryProps<BlockMap> {
            return Array.from(this._blockMap.entries()).reduce((a, [key, block]) => ({ ...a, [key]: block }), {}) as InputFactoryProps<BlockMap>;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blockDataFactory: BlockDataFactory<CompositeBlock> = (o: Record<string, any>) => {
        const blockMap = Object.entries(blocks).reduce<Record<keyof BlockMap, BlockDataInterface>>(
            (acc, [blockType, block]) =>
                o[blockType]
                    ? {
                          ...acc,
                          [blockType]: block.blockDataFactory(o[blockType]),
                      }
                    : acc,
            {} as Record<keyof BlockMap, BlockDataInterface>,
        );

        const block = new CompositeBlock();
        block._blockMap = blockMap;

        return block;
    };
    const blockInputFactory: BlockInputFactory<CompositeBlockInput> = (o) => {
        const blockMap: [string, BlockInputInterface | null][] = Object.entries(blocks).map(([blockType, block]) => [
            blockType,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            o[blockType] ? block.blockInputFactory(o[blockType] as any) : null, // setting the value to null will lead to validation error later, which is intendet
        ]);

        const blockInput = new CompositeBlockInput();
        blockInput._blockMap = new Map<string, BlockInputInterface | null>(blockMap);

        return blockInput;
    };

    // Decorate BlockDataFactory
    let decorateBlockDataFactory = blockDataFactory;
    if (MIGRATE.migrations) {
        const blockDataFactoryDecorator1 = createAppliedMigrationsBlockDataFactoryDecorator({ migrate: MIGRATE, blockName: name });
        decorateBlockDataFactory = blockDataFactoryDecorator1(decorateBlockDataFactory);
    }
    decorateBlockDataFactory = strictBlockDataFactoryDecorator(decorateBlockDataFactory);

    // Decorate BlockInputFactory
    const decorateBlockInputFactory = strictBlockInputFactoryDecorator(blockInputFactory);

    const block: Block<BlockDataInterface, CompositeBlockInputInterface<BlockMap>> = {
        name,
        blockDataFactory: decorateBlockDataFactory,
        blockInputFactory: decorateBlockInputFactory,
        blockMeta: {
            fields: Object.entries(blocks).map(([name, block]: [string, Block]) => {
                return {
                    name,
                    kind: BlockMetaFieldKind.Block,
                    block,
                    nullable: false,
                };
            }),
        },
        blockInputMeta: {
            fields: Object.entries(blocks).map(([name, block]: [string, Block]) => {
                return {
                    name,
                    kind: BlockMetaFieldKind.Block,
                    block,
                    nullable: false,
                };
            }),
        },
    };

    return block;
}
