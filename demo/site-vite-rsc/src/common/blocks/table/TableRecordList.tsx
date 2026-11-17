import clsx from "clsx";

import { convertTableDataToRecordList } from "./convertTableDataToRecordList";
import type { RenderTableCell, TableColumn, TableHeaderPosition, TableRow } from "./tableData";
import styles from "./TableRecordList.module.scss";

type TableRecordListProps<CellValue> = {
    columns: TableColumn[];
    rows: TableRow<CellValue>[];
    headerPosition: TableHeaderPosition;
    renderCell: RenderTableCell<CellValue>;
    hasCellContent: (value: CellValue) => boolean;
};

export function TableRecordList<CellValue>({ columns, rows, headerPosition, renderCell, hasCellContent }: TableRecordListProps<CellValue>) {
    const hasContent = (value: CellValue | undefined): value is CellValue => value !== undefined && hasCellContent(value);
    const records = convertTableDataToRecordList({ columns, rows, headerPosition })
        .map((record) => ({
            ...record,
            entries: record.entries.filter((entry) => hasContent(entry.label.value) || hasContent(entry.value.value)),
        }))
        .filter((record) => record.entries.length > 0);

    return (
        <table className={styles.root}>
            {records.map((record, recordIndex) => (
                <tbody key={record.id}>
                    {recordIndex > 0 && (
                        <tr aria-hidden="true">
                            <td colSpan={2} className={styles.recordSpacer} />
                        </tr>
                    )}
                    {record.entries.map((entry) => (
                        <tr key={entry.id} className={styles.row}>
                            {hasContent(entry.label.value) && (
                                <th
                                    scope="row"
                                    className={clsx(styles.cell, styles["cell--label"], entry.label.isHighlighted && styles["cell--highlighted"])}
                                >
                                    <div className={styles.cell__content}>{renderCell(entry.label.value)}</div>
                                </th>
                            )}
                            <td
                                colSpan={hasContent(entry.label.value) ? undefined : 2}
                                className={clsx(styles.cell, entry.value.isHighlighted && styles["cell--highlighted"])}
                            >
                                {hasContent(entry.value.value) && <div className={styles.cell__content}>{renderCell(entry.value.value)}</div>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            ))}
        </table>
    );
}
