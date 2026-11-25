import { plainToInstance, Type } from "class-transformer";
import { IsArray, IsString, ValidateNested } from "class-validator";

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
import type { MigrateVendorOptions } from "../migrations/types.js";
import { typeSafeBlockMigrationPipe } from "../migrations/typeSafeBlockMigrationPipe.js";
import { createOneOfBlock } from "./createOneOfBlock.js";
import {
    createTableSettingsDecorators,
    defaultTableColumnSettings,
    defaultTableRowSettings,
    type TableSettingsDeclaration,
} from "./createTableSettings.js";
import { buildMoveSizeAndHighlightingIntoSettingsMigration } from "./table-migrations/1-move-size-and-highlighting-into-settings.migration.js";
import type { BlockFactoryNameOrOptions } from "./types.js";

type CreateTableBlockOptions = (
    | {
          richText: Block;
          cellBlocks?: never;
      }
    | {
          /**
           * The first block is the default for new cells.
           */
          cellBlocks: Record<string, Block>;
          richText?: never;
      }
) & {
    /** Declared with `createTableSettings`. Defaults to `defaultTableRowSettings`. */
    rowSettings?: TableSettingsDeclaration;
    /** Declared with `createTableSettings`. Defaults to `defaultTableColumnSettings`. */
    columnSettings?: TableSettingsDeclaration;
};

export function createTableBlock(
    { rowSettings = defaultTableRowSettings, columnSettings = defaultTableColumnSettings, ...options }: CreateTableBlockOptions,
    nameOrOptions: BlockFactoryNameOrOptions = "Table",
): Block {
    const { name: tableName, ...blockOptions } = typeof nameOrOptions === "string" ? { name: nameOrOptions } : nameOrOptions;
    const CellBlock = options.cellBlocks
        ? createOneOfBlock({ supportedBlocks: options.cellBlocks, allowEmpty: false }, `${tableName}Cell`)
        : options.richText;
    const rowSettingsDecorators = createTableSettingsDecorators(rowSettings);
    const columnSettingsDecorators = createTableSettingsDecorators(columnSettings);

    const migrateVendor: MigrateVendorOptions = {
        version: 1,
        migrations: typeSafeBlockMigrationPipe([buildMoveSizeAndHighlightingIntoSettingsMigration({ columnSettings, rowSettings })]),
    };

    class TableBlockColumnData extends BlockData {
        @BlockField()
        id: string;

        @columnSettingsDecorators.dataField
        settings: BlockDataInterface;
    }

    class TableBlockColumnInput extends BlockInput {
        @BlockField()
        @IsString()
        id: string;

        @columnSettingsDecorators.inputField
        settings?: BlockInputInterface;

        transformToBlockData(): TableBlockColumnData {
            return blockInputToData(TableBlockColumnData, this);
        }
    }

    class TableBlockRowColumnValueData extends BlockData {
        @BlockField()
        columnId: string;

        @ChildBlock(CellBlock)
        value: BlockDataInterface;
    }

    class TableBlockRowColumnValueInput extends BlockInput {
        @BlockField()
        @IsString()
        columnId: string;

        @ChildBlockInput(CellBlock)
        value: BlockInputInterface;

        transformToBlockData(): TableBlockRowColumnValueData {
            return blockInputToData(TableBlockRowColumnValueData, this);
        }
    }

    class TableBlockRowData extends BlockData {
        @BlockField()
        id: string;

        @rowSettingsDecorators.dataField
        settings: BlockDataInterface;

        @BlockField(TableBlockRowColumnValueData)
        @Type(() => TableBlockRowColumnValueData)
        cellValues: TableBlockRowColumnValueData[] = [];
    }

    class TableBlockRowInput extends BlockInput {
        @BlockField()
        @IsString()
        id: string;

        @rowSettingsDecorators.inputField
        settings?: BlockInputInterface;

        @BlockField(TableBlockRowColumnValueInput)
        @ValidateNested({ each: true })
        @Type(() => TableBlockRowColumnValueInput)
        cellValues: TableBlockRowColumnValueInput[] = [];

        transformToBlockData(): TableBlockRowData {
            return plainToInstance(TableBlockRowData, {
                ...this,
                settings: this.settings?.transformToBlockData(),
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
                    name: CellBlock.name,
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

    return createBlock(TableBlockData, TableBlockInput, { name: tableName, ...blockOptions, migrateVendor });
}
