import type { ReactNode } from "react";

export type TableColumnSize = "extraSmall" | "small" | "standard" | "large" | "extraLarge";

export type TableColumn = {
    id: string;
    settings: { size: TableColumnSize; highlighted: boolean };
};

export type TableRow<CellValue> = {
    id: string;
    settings: { highlighted: boolean };
    cellValues: Array<{ columnId: string; value: CellValue }>;
};

export type TableHeaderPosition = "firstRow" | "firstColumn";

export type RenderTableCell<CellValue> = (value: CellValue, column: TableColumn) => ReactNode;

export function findCellValue<CellValue>(row: TableRow<CellValue>, column: TableColumn): CellValue | undefined {
    return row.cellValues.find((cellValue) => cellValue.columnId === column.id)?.value;
}
