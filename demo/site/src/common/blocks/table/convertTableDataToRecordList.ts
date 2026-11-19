import { findCellValue, type TableColumn, type TableHeaderPosition, type TableRow } from "./tableData";

type TableRecordCell<CellValue> = {
    value: CellValue | undefined;
    isHighlighted: boolean;
};

type TableRecordEntry<CellValue> = {
    id: string;
    label: TableRecordCell<CellValue>;
    value: TableRecordCell<CellValue>;
};

type TableRecord<CellValue> = {
    id: string;
    entries: TableRecordEntry<CellValue>[];
};

function toRecordCell<CellValue>(row: TableRow<CellValue>, column: TableColumn): TableRecordCell<CellValue> {
    return {
        value: findCellValue(row, column),
        isHighlighted: row.highlighted || column.highlighted,
    };
}

type TableData<CellValue> = {
    columns: TableColumn[];
    rows: TableRow<CellValue>[];
};

function convertRowsToRecords<CellValue>({ columns, rows }: TableData<CellValue>): TableRecord<CellValue>[] {
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

function convertColumnsToRecords<CellValue>({ columns, rows }: TableData<CellValue>): TableRecord<CellValue>[] {
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

export function convertTableDataToRecordList<CellValue>({
    headerPosition,
    ...tableData
}: TableData<CellValue> & { headerPosition: TableHeaderPosition }): TableRecord<CellValue>[] {
    return headerPosition === "firstRow" ? convertRowsToRecords(tableData) : convertColumnsToRecords(tableData);
}
