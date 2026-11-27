import { plainToInstance, Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsString, ValidateNested } from "class-validator";

import {
    type Block,
    BlockData,
    type BlockDataInterface,
    BlockInput,
    type BlockInputInterface,
    blockInputToData,
    type ChildBlockInfo,
    createBlock,
} from "../block.js";
import { ChildBlock } from "../decorators/child-block.js";
import { ChildBlockInput } from "../decorators/child-block-input.js";
import { BlockField } from "../decorators/field.js";
import type { BlockFactoryNameOrOptions } from "./types.js";

type CreateTableBlockOptions = {
    richText: Block;
};

enum ColumnSize {
    extraSmall = "extraSmall",
    small = "small",
    standard = "standard",
    large = "large",
    extraLarge = "extraLarge",
}

class TableBlockColumnData extends BlockData {
    @BlockField()
    id: string;

    @BlockField({ type: "enum", enum: ColumnSize })
    size: ColumnSize;

    @BlockField()
    highlighted: boolean;
}

class TableBlockColumnInput extends BlockInput {
    @BlockField()
    @IsString()
    id: string;

    @BlockField({ type: "enum", enum: ColumnSize })
    @IsEnum(ColumnSize)
    size: ColumnSize;

    @BlockField()
    @IsBoolean()
    highlighted: boolean;

    transformToBlockData(): TableBlockColumnData {
        return blockInputToData(TableBlockColumnData, this);
    }
}

export function createTableBlock({ richText: RichTextBlock }: CreateTableBlockOptions, nameOrOptions: BlockFactoryNameOrOptions = "Table"): Block {
    class TableBlockRowColumnValueData extends BlockData {
        @BlockField()
        columnId: string;

        @ChildBlock(RichTextBlock)
        value: BlockDataInterface;
    }

    class TableBlockRowColumnValueInput extends BlockInput {
        @BlockField()
        @IsString()
        columnId: string;

        @ChildBlockInput(RichTextBlock)
        value: BlockInputInterface;

        transformToBlockData(): TableBlockRowColumnValueData {
            return blockInputToData(TableBlockRowColumnValueData, this);
        }
    }

    class TableBlockRowData extends BlockData {
        @BlockField()
        id: string;

        @BlockField()
        highlighted: boolean;

        @BlockField(TableBlockRowColumnValueData)
        @Type(() => TableBlockRowColumnValueData)
        cellValues: TableBlockRowColumnValueData[] = [];
    }

    class TableBlockRowInput extends BlockInput {
        @BlockField()
        @IsString()
        id: string;

        @BlockField()
        @IsBoolean()
        highlighted: boolean;

        @BlockField(TableBlockRowColumnValueInput)
        @ValidateNested({ each: true })
        @Type(() => TableBlockRowColumnValueInput)
        cellValues: TableBlockRowColumnValueInput[] = [];

        transformToBlockData(): TableBlockRowData {
            return plainToInstance(TableBlockRowData, {
                ...this,
                cellValues: this.cellValues.map((cellValue) => cellValue.transformToBlockData()),
            });
        }
    }

    class TableBlockData extends BlockData {
        @BlockField(TableBlockColumnData)
        @Type(() => TableBlockColumnData)
        columns: TableBlockColumnData[] = [];

        @BlockField(TableBlockRowData)
        @Type(() => TableBlockRowData)
        rows: TableBlockRowData[] = [];

        childBlocksInfo(): ChildBlockInfo[] {
            const existingColumnIds = new Set(this.columns.map((column) => column.id));

            return this.rows.flatMap((row, rowIndex) =>
                row.cellValues.map((cellValue, cellValueIndex) => ({
                    visible: existingColumnIds.has(cellValue.columnId),
                    relJsonPath: ["rows", rowIndex, "cellValues", cellValueIndex, "value"],
                    block: cellValue.value,
                    name: RichTextBlock.name,
                })),
            );
        }
    }

    class TableBlockInput extends BlockInput {
        @BlockField(TableBlockColumnInput)
        @IsArray()
        @ValidateNested({ each: true })
        @Type(() => TableBlockColumnInput)
        columns: TableBlockColumnInput[] = [];

        @BlockField(TableBlockRowInput)
        @IsArray()
        @ValidateNested({ each: true })
        @Type(() => TableBlockRowInput)
        rows: TableBlockRowInput[] = [];

        transformToBlockData(): TableBlockData {
            return plainToInstance(TableBlockData, {
                ...this,
                columns: this.columns.map((column) => column.transformToBlockData()),
                rows: this.rows.map((row) => row.transformToBlockData()),
            });
        }
    }

    return createBlock(TableBlockData, TableBlockInput, nameOrOptions);
}
