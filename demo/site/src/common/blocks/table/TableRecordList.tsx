import clsx from "clsx";

import { convertTableDataToRecordList } from "./convertTableDataToRecordList";
import type { RenderTableCell, TableColumn, TableHeaderPosition, TableRow } from "./tableData";
import styles from "./TableRecordList.module.scss";

type TableRecordListProps<CellValue> = {
    columns: TableColumn[];
    rows: TableRow<CellValue>[];
    headerPosition: TableHeaderPosition;
    renderCell: RenderTableCell<CellValue>;
};

export function TableRecordList<CellValue>({ columns, rows, headerPosition, renderCell }: TableRecordListProps<CellValue>) {
    const records = convertTableDataToRecordList({ columns, rows, headerPosition });

    return (
        <table className={styles.root}>
            {records.map((record, recordIndex) => (
                <tbody key={record.id}>
                    {recordIndex > 0 && (
                        <tr aria-hidden="true">
                            <td colSpan={2} className={styles.recordSpacer} />
                        </tr>
                    )}
                    {record.entries
                        .filter((entry) => entry.label.value !== undefined || entry.value.value !== undefined)
                        .map((entry) => (
                            <tr key={entry.id} className={styles.row}>
                                {entry.label.value !== undefined && (
                                    <th
                                        scope="row"
                                        className={clsx(styles.cell, styles["cell--label"], entry.label.isHighlighted && styles["cell--highlighted"])}
                                    >
                                        <div className={styles.cell__content}>{renderCell(entry.label.value)}</div>
                                    </th>
                                )}
                                <td
                                    colSpan={entry.label.value === undefined ? 2 : undefined}
                                    className={clsx(styles.cell, entry.value.isHighlighted && styles["cell--highlighted"])}
                                >
                                    {entry.value.value !== undefined && <div className={styles.cell__content}>{renderCell(entry.value.value)}</div>}
                                </td>
                            </tr>
                        ))}
                </tbody>
            ))}
        </table>
    );
}
