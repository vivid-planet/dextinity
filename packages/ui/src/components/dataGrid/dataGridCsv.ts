import type { DataGridCellValue, DataGridColumn, DataGridColumnVisibility } from "./DataGrid";
import { getDataGridCellText, getDataGridCellValue } from "./dataGridValue";

/**
 * What to export from a `DataGrid` as CSV.
 */
export interface DataGridCsvOptions<Row> {
    /** The columns of the grid; hidden ones are left out. */
    columns: DataGridColumn<Row>[];
    /** The rows to export, e.g. all rows rather than the current page. */
    rows: Row[];
    /** Which columns are shown, as passed to the grid. */
    columnVisibility?: DataGridColumnVisibility;
    /** The children of a row, exported below it. */
    getSubRows?: (row: Row) => Row[] | undefined;
    /**
     * Separates the values of a line; `;` suits spreadsheet apps in locales with a decimal comma.
     *
     * @defaultValue `","`
     */
    separator?: string;
}

function exportValue<Row>(row: Row, column: DataGridColumn<Row>): DataGridCellValue | undefined {
    if (column.exportValue != null) {
        return column.exportValue(row);
    }
    const value = getDataGridCellValue(row, column);
    if (column.editor?.type !== "select" && (typeof value === "number" || typeof value === "boolean")) {
        return value;
    }
    return getDataGridCellText(row, column);
}

const formulaPrefixes = ["=", "+", "-", "@", "\t", "\r"];

function csvField(value: DataGridCellValue | undefined, separator: string): string {
    if (value == null) {
        return "";
    }
    let text = String(value);
    // A spreadsheet app runs text starting like a formula as one, so it is kept as text
    if (typeof value === "string" && formulaPrefixes.some((prefix) => text.startsWith(prefix))) {
        text = `'${text}`;
    }
    return text.includes(separator) || /["\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * The shown columns of a `DataGrid` and the given rows as CSV text, with the headers as the first line. A cell's text is the
 * column's `exportValue`, or its value.
 */
export function getDataGridCsv<Row>({ columns, rows, columnVisibility, getSubRows, separator = "," }: DataGridCsvOptions<Row>): string {
    const shownColumns = columns.filter((column) => columnVisibility?.[column.key] !== false);
    const lines = [shownColumns.map((column) => csvField(column.header, separator)).join(separator)];
    const addRows = (levelRows: Row[]) => {
        levelRows.forEach((row) => {
            lines.push(shownColumns.map((column) => csvField(exportValue(row, column), separator)).join(separator));
            addRows(getSubRows?.(row) ?? []);
        });
    };
    addRows(rows);
    return lines.join("\r\n");
}

/**
 * Downloads the shown columns of a `DataGrid` and the given rows as a CSV file, e.g. from an "Export" action in the toolbar.
 */
export function downloadDataGridCsv<Row>(fileName: string, options: DataGridCsvOptions<Row>): void {
    // The byte order mark makes spreadsheet apps read the file as UTF-8
    const blob = new Blob(["﻿", getDataGridCsv(options)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.display = "none";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
