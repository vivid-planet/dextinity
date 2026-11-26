import { v4 as uuid } from "uuid";
import { z } from "zod";

import type { TableBlockRowState, TableBlockState } from "../../createTableBlock";
import { createTableSettingsState, type TableSettingsState } from "../createTableSettings";
import type { TableBlockConfig } from "../TableBlockContext";
import { getNewColumn } from "./column";
import { rteSchema } from "./rteSchema";

const getNewRow = (cellValues: TableBlockRowState["cellValues"], settings: TableSettingsState, newRowId: string = uuid()): TableBlockRowState => {
    return { id: newRowId, settings, cellValues };
};

export const rowInsertSchema = z.object({
    settings: z.record(z.string(), z.unknown()).optional(),
    cellValues: z.array(rteSchema),
});

export type RowInsertData = {
    settings?: TableSettingsState;
    cellValues: unknown[];
};

export const insertRowDataAtIndex = (
    state: TableBlockState,
    insertData: RowInsertData,
    index: number,
    table: TableBlockConfig,
    newRowId: string = uuid(),
): TableBlockState => {
    const { CellBlock } = table;
    const updatedColumns = [...state.columns];
    const newColumnIds: string[] = [];

    const cellValuesToInsert = [...insertData.cellValues];

    const numberOfValuesWithoutColumns = cellValuesToInsert.length - updatedColumns.length;
    Array.from({ length: numberOfValuesWithoutColumns }).forEach(() => {
        const newColumn = getNewColumn(table.columnSettings);
        updatedColumns.push(newColumn);
        newColumnIds.push(newColumn.id);
    });

    const numberOfColumnsWithoutNewValue = updatedColumns.length - cellValuesToInsert.length;
    Array.from({ length: numberOfColumnsWithoutNewValue }).forEach(() => {
        cellValuesToInsert.push(CellBlock.defaultValues());
    });

    const newRow = getNewRow(
        cellValuesToInsert.map((value, index) => {
            return { columnId: updatedColumns[index].id, value };
        }),
        createTableSettingsState(table.rowSettings, insertData.settings),
        newRowId,
    );

    let rowsBeforeTargetIndex = state.rows.slice(0, index);
    let rowsAfterTargetIndex = state.rows.slice(index);

    newColumnIds.forEach((newColumnId) => {
        rowsBeforeTargetIndex = rowsBeforeTargetIndex.map((row) => ({
            ...row,
            cellValues: [...row.cellValues, { columnId: newColumnId, value: CellBlock.defaultValues() }],
        }));
        rowsAfterTargetIndex = rowsAfterTargetIndex.map((row) => ({
            ...row,
            cellValues: [...row.cellValues, { columnId: newColumnId, value: CellBlock.defaultValues() }],
        }));
    });

    return {
        ...state,
        columns: updatedColumns,
        rows: [...rowsBeforeTargetIndex, newRow, ...rowsAfterTargetIndex],
    };
};

export const deleteRowById = (state: TableBlockState, rowIdToDelete: string): TableBlockState => {
    return {
        ...state,
        rows: state.rows.filter(({ id }) => id !== rowIdToDelete),
    };
};

export const getDuplicatedRowInsertData = (state: TableBlockState, rowId: string, { CellBlock }: TableBlockConfig): RowInsertData | null => {
    const row = state.rows.find(({ id }) => id === rowId);
    if (!row) {
        return null;
    }

    const cellValuesInOrderOfColumns = state.columns.map((column) => {
        return row.cellValues.find((cellValue) => cellValue.columnId === column.id)?.value ?? CellBlock.defaultValues();
    });

    return {
        settings: row.settings,
        cellValues: cellValuesInOrderOfColumns,
    };
};

export const getInsertDataFromRowById = (state: TableBlockState, rowId: string, { CellBlock }: TableBlockConfig): RowInsertData | null => {
    const row = state.rows.find(({ id }) => id === rowId);
    if (!row) {
        return null;
    }

    const cellValuesInOrderOfColumns = state.columns.map((column) => {
        return CellBlock.state2Output(row.cellValues.find((cellValue) => cellValue.columnId === column.id)?.value ?? CellBlock.defaultValues());
    });

    return {
        settings: row.settings,
        cellValues: cellValuesInOrderOfColumns,
    };
};

export const setRowSetting = (state: TableBlockState, rowId: string, key: string, value: unknown): TableBlockState => {
    return {
        ...state,
        rows: state.rows.map((row) => (row.id === rowId ? { ...row, settings: { ...row.settings, [key]: value } } : row)),
    };
};

export const moveRowToIndex = ({ state, rowId, targetIndex }: { state: TableBlockState; rowId: string; targetIndex: number }): TableBlockState => {
    const movingRow = state.rows.find(({ id }) => id === rowId);
    const isTargetIndexInTable = targetIndex >= 0 && targetIndex < state.rows.length;
    if (!movingRow || !isTargetIndexInTable) {
        return state;
    }

    const otherRows = state.rows.filter(({ id }) => id !== rowId);
    return {
        ...state,
        rows: [...otherRows.slice(0, targetIndex), movingRow, ...otherRows.slice(targetIndex)],
    };
};
