import type { DataGridColumn } from "./DataGrid";

export function getDataGridCellValue<Row>(row: Row, column: DataGridColumn<Row>): unknown {
    return column.getValue != null ? column.getValue(row) : (row as Record<string, unknown>)[column.key];
}

export function getDataGridCellText<Row>(row: Row, column: DataGridColumn<Row>): string {
    const value = getDataGridCellValue(row, column);
    if (column.editor?.type === "select") {
        const option = column.editor.options.find((candidate) => candidate.value === value);
        if (option != null) {
            return option.label;
        }
    }
    if (value == null || typeof value === "object") {
        return "";
    }
    return String(value);
}
