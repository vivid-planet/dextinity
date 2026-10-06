import { plainToInstance, Transform, Type } from "class-transformer";
import { IsBoolean, IsIn, IsUUID, ValidateNested } from "class-validator";

import {
    type Block,
    type BlockContext,
    BlockData,
    type BlockDataInterface,
    BlockInput,
    type BlockInputInterface,
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

interface ColumnsBlockLayout {
    name: string;
}

interface ColumnsBlockFactoryOptions<B extends Block> {
    contentBlock: B;
    layouts: ColumnsBlockLayout[];
}

interface ColumnsBlockInputInterface<B extends BlockInputInterface> extends SimpleBlockInputInterface {
    layout: string;
    columns: Array<
        {
            key: string;
            visible: boolean;
            props: B;
        } & SimpleBlockInputInterface
    >;
}

export class ColumnsBlockFactory {
    static create<B extends Block>(
        { contentBlock, layouts }: ColumnsBlockFactoryOptions<B>,
        nameOrOptions: BlockFactoryNameOrOptions,
    ): Block<BlockDataInterface, ColumnsBlockInputInterface<ExtractBlockInput<B>>> {
        if (layouts.length === 0) {
            throw new Error(`Number of layouts must be greater than 0!`);
        }

        const layoutNames = layouts.map((layout) => layout.name);

        class ColumnsBlockColumn extends BlockData {
            @BlockField()
            key: string;

            @BlockField()
            visible: boolean;

            @Transform(({ value }) => (isBlockDataInterface(value) ? value : contentBlock.blockDataFactory(value)), { toClassOnly: true })
            @BlockField(contentBlock)
            props: BlockDataInterface;
        }

        class ColumnsBlockColumnInput<Input extends BlockInputInterface> extends BlockInput {
            @BlockField()
            @IsUUID()
            key: string;

            @IsBoolean()
            @BlockField()
            visible: boolean;

            @Transform(({ value }) => (isBlockInputInterface(value) ? value : contentBlock.blockInputFactory(value)), { toClassOnly: true })
            @ValidateNested()
            @BlockField(contentBlock)
            props: Input;

            transformToBlockData(): ColumnsBlockColumn {
                return plainToInstance(ColumnsBlockColumn, {
                    ...this,
                    props: this.props.transformToBlockData(),
                });
            }
        }

        class ColumnsBlockData extends BlockData {
            @BlockField()
            layout: string;

            @Type(() => ColumnsBlockColumn)
            @BlockField(ColumnsBlockColumn)
            columns: ColumnsBlockColumn[];

            childBlocksInfo(): ChildBlockInfo[] {
                return this.columns.map((column, columnIndex) => ({
                    visible: column.visible,
                    relJsonPath: ["columns", columnIndex, "props"],
                    block: column.props,
                    name: contentBlock.name,
                }));
            }

            async transformToPlain({ includeInvisibleContent }: BlockContext): Promise<TraversableTransformBlockResponse> {
                return {
                    layout: this.layout,
                    columns: includeInvisibleContent ? this.columns : this.columns.filter((c) => c.visible),
                };
            }
        }

        class ColumnsBlockInput extends BlockInput {
            @BlockField()
            @IsIn(layoutNames)
            layout: string;

            @Type(() => ColumnsBlockColumnInput)
            @BlockField(ColumnsBlockColumnInput)
            @ValidateNested()
            columns: ColumnsBlockColumnInput<ExtractBlockInput<B>>[];

            transformToBlockData(): ColumnsBlockData {
                return plainToInstance(ColumnsBlockData, {
                    ...this,
                    columns: this.columns.map((column) => column.transformToBlockData()),
                });
            }
        }

        return createBlock(ColumnsBlockData, ColumnsBlockInput, nameOrOptions);
    }
}
