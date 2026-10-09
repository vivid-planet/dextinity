import type { ReactNode } from "react";

export type TableColumn = {
    id: string;
    highlighted: boolean;
};

export type TableRow<CellValue> = {
    id: string;
    highlighted: boolean;
    cellValues: Array<{ columnId: string; value: CellValue }>;
};

export type RenderTableCell<CellValue> = (value: CellValue) => ReactNode;

export function findCellValue<CellValue>(row: TableRow<CellValue>, column: TableColumn): CellValue | undefined {
    return row.cellValues.find((cellValue) => cellValue.columnId === column.id)?.value;
}
