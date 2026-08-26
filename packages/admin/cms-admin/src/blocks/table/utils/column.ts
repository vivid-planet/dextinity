import { v4 as uuid } from "uuid";
import { z } from "zod";

import type { TableBlockData } from "../../../blocks.generated";
import type { TableBlockState } from "../../createTableBlock";
import type { BlockInterface } from "../../types";
import { insertRowDataAtIndex, type RowInsertData } from "./row";
import { rteSchema } from "./rteSchema";

export const getNewColumn = (): TableBlockData["columns"][number] => {
    return { id: uuid(), highlighted: false, size: "standard" };
};

const columnSizeSchema = z.enum(["extraSmall", "small", "standard", "large", "extraLarge"]);
type ColumnSize = z.infer<typeof columnSizeSchema>;

export const columnInsertSchema = z.object({
    size: columnSizeSchema,
    highlighted: z.boolean(),
    cellValues: z.array(rteSchema),
});

export type ColumnInsertData = {
    size: ColumnSize;
    highlighted: boolean;
    cellValues: unknown[];
};

export const getDuplicatedColumnInsertData = (
    state: TableBlockState,
    columnIndex: number,
    RichTextBlock: BlockInterface,
): ColumnInsertData | null => {
    const sourceColumn = state.columns[columnIndex];

    if (!sourceColumn) {
        return null;
    }

    const sourceCellsValues = state.rows.map(({ cellValues }) => cellValues.find((cellValue) => cellValue.columnId === sourceColumn.id));
    const newCellValues = sourceCellsValues.map((sourceCellValue) => sourceCellValue?.value ?? RichTextBlock.defaultValues());

    return {
        size: sourceColumn.size,
        highlighted: sourceColumn.highlighted,
        cellValues: newCellValues,
    };
};

export const getInsertDataFromColumnById = (state: TableBlockState, columnId: string, RichTextBlock: BlockInterface): ColumnInsertData | null => {
    const column = state.columns.find(({ id }) => id === columnId);
    if (!column) {
        return null;
    }

    return {
        size: column.size,
        highlighted: column.highlighted,
        cellValues: state.rows.map((row) => {
            const cellValueOfColumn = row.cellValues.find((cellValue) => cellValue.columnId === columnId);
            return RichTextBlock.state2Output(cellValueOfColumn?.value ?? RichTextBlock.defaultValues());
        }),
    };
};

export const insertColumnDataAtIndex = (
    state: TableBlockState,
    columnInsertData: { size: ColumnSize; highlighted: boolean; cellValues: unknown[] },
    index: number,
    RichTextBlock: BlockInterface,
    newColumnId: string = uuid(),
): TableBlockState => {
    const numberOfRowsToBeAdded = columnInsertData.cellValues.length - state.rows.length;

    for (let i = 0; i < numberOfRowsToBeAdded; i++) {
        const newRowInsertData: RowInsertData = {
            highlighted: false,
            cellValues: state.columns.map(() => RichTextBlock.defaultValues()),
        };
        state = insertRowDataAtIndex(state, newRowInsertData, state.rows.length, RichTextBlock);
    }

    const columnsBeforeIndex = state.columns.slice(0, index);
    const columnsAfterIndex = state.columns.slice(index);
    const newColumn = {
        id: newColumnId,
        size: columnInsertData.size,
        highlighted: columnInsertData.highlighted,
    };

    return {
        ...state,
        columns: [...columnsBeforeIndex, newColumn, ...columnsAfterIndex],
        rows: state.rows.map((row, rowIndex) => {
            const newCell = { columnId: newColumn.id, value: columnInsertData.cellValues[rowIndex] ?? RichTextBlock.defaultValues() };
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

export const setColumnSize = (state: TableBlockState, columnId: string, size: ColumnSize): TableBlockState => {
    return {
        ...state,
        columns: state.columns.map((column) => (column.id === columnId ? { ...column, size } : column)),
    };
};
