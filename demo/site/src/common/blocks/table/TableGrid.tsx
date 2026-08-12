import clsx from "clsx";

import { findCellValue, type RenderTableCell, type TableColumn, type TableColumnSize, type TableRow } from "./tableData";
import styles from "./TableGrid.module.scss";

const minimumWidthClassByColumnSize: Record<TableColumnSize, string> = {
    extraSmall: styles["cell--minWidthExtraSmall"],
    small: styles["cell--minWidthSmall"],
    standard: styles["cell--minWidthStandard"],
    large: styles["cell--minWidthLarge"],
    extraLarge: styles["cell--minWidthExtraLarge"],
};

type TableGridProps<CellValue> = {
    columns: TableColumn[];
    rows: TableRow<CellValue>[];
    renderCell: RenderTableCell<CellValue>;
    /**
     * Uses the column width from the admin as a minimum cell width. Only for a table that can scroll,
     * because a table without a scroll container has to fit the page.
     */
    hasMinimumColumnWidths?: boolean;
};

export function TableGrid<CellValue>({ columns, rows, renderCell, hasMinimumColumnWidths }: TableGridProps<CellValue>) {
    return (
        <table className={styles.table}>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.id} className={styles.row}>
                        {columns.map((column) => {
                            const cellValue = findCellValue(row, column);
                            const isCellHighlighted = row.highlighted || column.highlighted;

                            return (
                                <td
                                    key={column.id}
                                    className={clsx(
                                        styles.cell,
                                        isCellHighlighted && styles["cell--highlighted"],
                                        hasMinimumColumnWidths && minimumWidthClassByColumnSize[column.size],
                                    )}
                                >
                                    {cellValue !== undefined && <div className={styles.cell__content}>{renderCell(cellValue)}</div>}
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
