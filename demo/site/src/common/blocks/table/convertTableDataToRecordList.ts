import { findCellValue, type TableColumn, type TableHeaderAxis, type TableRow } from "./tableData";

type TableRecordCell<CellValue> = {
    value: CellValue | undefined;
    isHighlighted: boolean;
};

export type TableRecordEntry<CellValue> = {
    id: string;
    label: TableRecordCell<CellValue>;
    value: TableRecordCell<CellValue>;
};

export type TableRecord<CellValue> = {
    id: string;
    entries: TableRecordEntry<CellValue>[];
};

function toRecordCell<CellValue>(row: TableRow<CellValue>, column: TableColumn): TableRecordCell<CellValue> {
    return {
        value: findCellValue(row, column),
        isHighlighted: row.highlighted || column.highlighted,
    };
}

/**
 * Pairs every cell of a table with its header cell, giving one record per row or per column. Both axes
 * are the same operation with the indexes swapped.
 */
export function convertTableDataToRecordList<CellValue>({
    columns,
    rows,
    headerAxis,
}: {
    columns: TableColumn[];
    rows: TableRow<CellValue>[];
    headerAxis: TableHeaderAxis;
}): TableRecord<CellValue>[] {
    if (headerAxis === "row") {
        const [headerRow, ...recordRows] = rows;

        if (!headerRow) {
            return [];
        }

        return recordRows.map((recordRow) => ({
            id: recordRow.id,
            entries: columns.map((column) => ({
                id: column.id,
                label: toRecordCell(headerRow, column),
                value: toRecordCell(recordRow, column),
            })),
        }));
    }

    const [headerColumn, ...recordColumns] = columns;

    if (!headerColumn) {
        return [];
    }

    return recordColumns.map((recordColumn) => ({
        id: recordColumn.id,
        entries: rows.map((row) => ({
            id: row.id,
            label: toRecordCell(row, headerColumn),
            value: toRecordCell(row, recordColumn),
        })),
    }));
}
