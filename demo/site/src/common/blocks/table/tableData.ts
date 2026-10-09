import type { ReactNode } from "react";

export type TableColumnSize = "extraSmall" | "small" | "standard" | "large" | "extraLarge";

export type TableColumn = {
    id: string;
    /** Column width chosen in the admin. */
    size: TableColumnSize;
    highlighted: boolean;
};

export type TableRow<CellValue> = {
    id: string;
    highlighted: boolean;
    cellValues: Array<{ columnId: string; value: CellValue }>;
};

/** Which side of the table holds the labels for the other side's cells. */
export type TableHeaderAxis = "row" | "column";

/** Renders one cell. Each table block passes its own rich text block. */
export type RenderTableCell<CellValue> = (value: CellValue) => ReactNode;

export function findCellValue<CellValue>(row: TableRow<CellValue>, column: TableColumn): CellValue | undefined {
    return row.cellValues.find((cellValue) => cellValue.columnId === column.id)?.value;
}
