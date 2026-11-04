import { plainToInstance, Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsString } from "class-validator";

import { Block, BlockData, BlockDataInterface, BlockInput, BlockInputInterface, blockInputToData, createBlock } from "../block";
import { ChildBlock } from "../decorators/child-block";
import { ChildBlockInput } from "../decorators/child-block-input";
import { BlockField } from "../decorators/field";
import { BlockFactoryNameOrOptions } from "./types";

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
        @Type(() => TableBlockRowColumnValueInput)
        cellValues: TableBlockRowColumnValueInput[] = [];

        transformToBlockData(): TableBlockRowData {
            return blockInputToData(TableBlockRowData, this);
        }
    }

    class TableBlockData extends BlockData {
        @BlockField(TableBlockColumnData)
        @Type(() => TableBlockColumnData)
        columns: TableBlockColumnData[] = [];

        @BlockField(TableBlockRowData)
        @Type(() => TableBlockRowData)
        rows: TableBlockRowData[] = [];
    }

    class TableBlockInput extends BlockInput {
        @BlockField(TableBlockColumnInput)
        @IsArray()
        @Type(() => TableBlockColumnInput)
        columns: TableBlockColumnInput[] = [];

        @BlockField(TableBlockRowInput)
        @IsArray()
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
