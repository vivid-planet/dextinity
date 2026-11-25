import { v4 as uuid } from "uuid";
import { z } from "zod";

import type { TableBlockColumnState, TableBlockState } from "../../createTableBlock";
import { createTableSettingsState, type TableSettingsDeclaration, type TableSettingsState } from "../createTableSettings";
import type { TableBlockConfig } from "../TableBlockContext";
import { insertRowDataAtIndex, type RowInsertData } from "./row";
import { rteSchema } from "./rteSchema";

export const getNewColumn = (settings: TableSettingsDeclaration): TableBlockColumnState => {
    return { id: uuid(), highlighted: false, size: "standard", settings: createTableSettingsState(settings) };
};

const columnSizeSchema = z.enum(["extraSmall", "small", "standard", "large", "extraLarge"]);
type ColumnSize = z.infer<typeof columnSizeSchema>;

export const columnInsertSchema = z.object({
    size: columnSizeSchema,
    highlighted: z.boolean(),
    settings: z.record(z.string(), z.unknown()).optional(),
    cellValues: z.array(rteSchema),
});

export type ColumnInsertData = {
    size: ColumnSize;
    highlighted: boolean;
    settings?: TableSettingsState;
    cellValues: unknown[];
};

export const getDuplicatedColumnInsertData = (
    state: TableBlockState,
    columnIndex: number,
    { CellBlock }: TableBlockConfig,
): ColumnInsertData | null => {
    const sourceColumn = state.columns[columnIndex];

    if (!sourceColumn) {
        return null;
    }

    const sourceCellsValues = state.rows.map(({ cellValues }) => cellValues.find((cellValue) => cellValue.columnId === sourceColumn.id));
    const newCellValues = sourceCellsValues.map((sourceCellValue) => sourceCellValue?.value ?? CellBlock.defaultValues());

    return {
        size: sourceColumn.size,
        highlighted: sourceColumn.highlighted,
        settings: sourceColumn.settings,
        cellValues: newCellValues,
    };
};

export const getInsertDataFromColumnById = (state: TableBlockState, columnId: string, { CellBlock }: TableBlockConfig): ColumnInsertData | null => {
    const column = state.columns.find(({ id }) => id === columnId);
    if (!column) {
        return null;
    }

    return {
        size: column.size,
        highlighted: column.highlighted,
        settings: column.settings,
        cellValues: state.rows.map((row) => {
            const cellValueOfColumn = row.cellValues.find((cellValue) => cellValue.columnId === columnId);
            return CellBlock.state2Output(cellValueOfColumn?.value ?? CellBlock.defaultValues());
        }),
    };
};

export const insertColumnDataAtIndex = (
    state: TableBlockState,
    columnInsertData: ColumnInsertData,
    index: number,
    table: TableBlockConfig,
    newColumnId: string = uuid(),
): TableBlockState => {
    const { CellBlock } = table;
    const numberOfRowsToBeAdded = columnInsertData.cellValues.length - state.rows.length;

    for (let i = 0; i < numberOfRowsToBeAdded; i++) {
        const newRowInsertData: RowInsertData = {
            highlighted: false,
            cellValues: state.columns.map(() => CellBlock.defaultValues()),
        };
        state = insertRowDataAtIndex(state, newRowInsertData, state.rows.length, table);
    }

    const columnsBeforeIndex = state.columns.slice(0, index);
    const columnsAfterIndex = state.columns.slice(index);
    const newColumn: TableBlockColumnState = {
        id: newColumnId,
        size: columnInsertData.size,
        highlighted: columnInsertData.highlighted,
        settings: createTableSettingsState(table.columnSettings, columnInsertData.settings),
    };

    return {
        ...state,
        columns: [...columnsBeforeIndex, newColumn, ...columnsAfterIndex],
        rows: state.rows.map((row, rowIndex) => {
            const newCell = { columnId: newColumn.id, value: columnInsertData.cellValues[rowIndex] ?? CellBlock.defaultValues() };
            return {
                ...row,
                cellValues: [...row.cellValues, newCell],
            };
        }),
    };
};

export const removeColumnFromState = (state: TableBlockState, columnId: string): TableBlockState => {
    return {
        ...state,
        columns: state.columns.filter((column) => column.id !== columnId),
        rows: state.rows.map((row) => ({
            ...row,
            cellValues: row.cellValues.filter((cellValue) => cellValue.columnId !== columnId),
        })),
    };
};

export const toggleColumnHighlight = (state: TableBlockState, columnId: string): TableBlockState => {
    return {
        ...state,
        columns: state.columns.map((column) => {
            if (column.id === columnId) {
                return { ...column, highlighted: !column.highlighted };
            }
            return column;
        }),
    };
};

export const setColumnSetting = (state: TableBlockState, columnId: string, key: string, value: unknown): TableBlockState => {
    return {
        ...state,
        columns: state.columns.map((column) => (column.id === columnId ? { ...column, settings: { ...column.settings, [key]: value } } : column)),
    };
};

export const setColumnSize = (state: TableBlockState, columnId: string, size: ColumnSize): TableBlockState => {
    return {
        ...state,
        columns: state.columns.map((column) => (column.id === columnId ? { ...column, size } : column)),
    };
};

export const moveColumnToIndex = ({
    state,
    columnId,
    targetIndex,
}: {
    state: TableBlockState;
    columnId: string;
    targetIndex: number;
}): TableBlockState => {
    const movingColumn = state.columns.find(({ id }) => id === columnId);
    const isTargetIndexInTable = targetIndex >= 0 && targetIndex < state.columns.length;
    if (!movingColumn || !isTargetIndexInTable) {
        return state;
    }

    const otherColumns = state.columns.filter(({ id }) => id !== columnId);
    return {
        ...state,
        columns: [...otherColumns.slice(0, targetIndex), movingColumn, ...otherColumns.slice(targetIndex)],
    };
};
