import { v4 as uuid } from "uuid";
import { z } from "zod";

import type { TableBlockRowState, TableBlockState } from "../../createTableBlock";
import type { BlockInterface } from "../../types";
import { getNewColumn } from "./column";
import { rteSchema } from "./rteSchema";

const getNewRow = (cellValues: TableBlockRowState["cellValues"], newRowId: string = uuid()): TableBlockRowState => {
    return { id: newRowId, highlighted: false, cellValues };
};

export const rowInsertSchema = z.object({
    highlighted: z.boolean(),
    cellValues: z.array(rteSchema),
});

export type RowInsertData = {
    highlighted: boolean;
    cellValues: unknown[];
};

export const insertRowDataAtIndex = (
    state: TableBlockState,
    insertData: RowInsertData,
    index: number,
    RichTextBlock: BlockInterface,
    newRowId: string = uuid(),
): TableBlockState => {
    const updatedColumns = [...state.columns];
    const newColumnIds: string[] = [];

    const cellValuesToInsert = [...insertData.cellValues];

    const numberOfValuesWithoutColumns = cellValuesToInsert.length - updatedColumns.length;
    Array.from({ length: numberOfValuesWithoutColumns }).forEach(() => {
        const newColumn = getNewColumn();
        updatedColumns.push(newColumn);
        newColumnIds.push(newColumn.id);
    });

    const numberOfColumnsWithoutNewValue = updatedColumns.length - cellValuesToInsert.length;
    Array.from({ length: numberOfColumnsWithoutNewValue }).forEach(() => {
        cellValuesToInsert.push(RichTextBlock.defaultValues());
    });

    const newRow = getNewRow(
        cellValuesToInsert.map((value, index) => {
            return { columnId: updatedColumns[index].id, value };
        }),
        newRowId,
    );

    let rowsBeforeTargetIndex = state.rows.slice(0, index);
    let rowsAfterTargetIndex = state.rows.slice(index);

    newColumnIds.forEach((newColumnId) => {
        rowsBeforeTargetIndex = rowsBeforeTargetIndex.map((row) => ({
            ...row,
            cellValues: [...row.cellValues, { columnId: newColumnId, value: RichTextBlock.defaultValues() }],
        }));
        rowsAfterTargetIndex = rowsAfterTargetIndex.map((row) => ({
            ...row,
            cellValues: [...row.cellValues, { columnId: newColumnId, value: RichTextBlock.defaultValues() }],
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

export const getDuplicatedRowInsertData = (state: TableBlockState, rowId: string, RichTextBlock: BlockInterface): RowInsertData | null => {
    const row = state.rows.find(({ id }) => id === rowId);
    if (!row) {
        return null;
    }

    const cellValuesInOrderOfColumns = state.columns.map((column) => {
        return row.cellValues.find((cellValue) => cellValue.columnId === column.id)?.value ?? RichTextBlock.defaultValues();
    });

    return {
        highlighted: row.highlighted,
        cellValues: cellValuesInOrderOfColumns,
    };
};

export const getInsertDataFromRowById = (state: TableBlockState, rowId: string, RichTextBlock: BlockInterface): RowInsertData | null => {
    const row = state.rows.find(({ id }) => id === rowId);
    if (!row) {
        return null;
    }

    const cellValuesInOrderOfColumns = state.columns.map((column) => {
        return RichTextBlock.state2Output(
            row.cellValues.find((cellValue) => cellValue.columnId === column.id)?.value ?? RichTextBlock.defaultValues(),
        );
    });

    return {
        highlighted: row.highlighted,
        cellValues: cellValuesInOrderOfColumns,
    };
};
