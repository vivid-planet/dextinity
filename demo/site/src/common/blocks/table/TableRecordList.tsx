import clsx from "clsx";

import type { TableRecord } from "./convertTableDataToRecordList";
import type { RenderTableCell } from "./tableData";
import styles from "./TableRecordList.module.scss";

type TableRecordListProps<CellValue> = {
    records: TableRecord<CellValue>[];
    renderCell: RenderTableCell<CellValue>;
};

/** Renders each record as a group of label and value pairs, so that a wide table needs no sideways scrolling. */
export function TableRecordList<CellValue>({ records, renderCell }: TableRecordListProps<CellValue>) {
    return (
        <table className={styles.table}>
            {records.map((record, recordIndex) => (
                <tbody key={record.id}>
                    {recordIndex > 0 && (
                        <tr aria-hidden="true">
                            <td colSpan={2} className={styles.spacerCell} />
                        </tr>
                    )}
                    {record.entries
                        .filter((entry) => entry.label.value !== undefined || entry.value.value !== undefined)
                        .map((entry) => {
                            const valueCell = (
                                <td
                                    colSpan={entry.label.value === undefined ? 2 : undefined}
                                    className={clsx(styles.cell, entry.value.isHighlighted && styles["cell--highlighted"])}
                                >
                                    {entry.value.value !== undefined && <div className={styles.cell__content}>{renderCell(entry.value.value)}</div>}
                                </td>
                            );

                            return (
                                <tr key={entry.id} className={styles.row}>
                                    {entry.label.value !== undefined && (
                                        <th
                                            scope="row"
                                            className={clsx(styles.cell, styles.labelCell, entry.label.isHighlighted && styles["cell--highlighted"])}
                                        >
                                            <div className={styles.cell__content}>{renderCell(entry.label.value)}</div>
                                        </th>
                                    )}
                                    {valueCell}
                                </tr>
                            );
                        })}
                </tbody>
            ))}
        </table>
    );
}
