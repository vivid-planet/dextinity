import clsx from "clsx";

import { findCellValue, type RenderTableCell, type TableColumn, type TableColumnSize, type TableHeaderAxis, type TableRow } from "./tableData";
import styles from "./TableGrid.module.scss";

const minimumWidthClassByColumnSize: Record<TableColumnSize, string> = {
    extraSmall: styles["cell--minWidthExtraSmall"],
    small: styles["cell--minWidthSmall"],
    standard: styles["cell--minWidthStandard"],
    large: styles["cell--minWidthLarge"],
    extraLarge: styles["cell--minWidthExtraLarge"],
};

const headerCellScopeByHeaderAxis: Record<TableHeaderAxis, "col" | "row"> = {
    row: "col",
    column: "row",
};

type TableGridProps<CellValue> = {
    columns: TableColumn[];
    rows: TableRow<CellValue>[];
    renderCell: RenderTableCell<CellValue>;
    /** Which side holds the header cells. The table data does not say, so without it every cell is a data cell. */
    headerAxis?: TableHeaderAxis;
    /**
     * Uses the column width from the admin as a minimum cell width. Only for a table that can scroll,
     * because a table without a scroll container has to fit the page.
     */
    hasMinimumColumnWidths?: boolean;
};

export function TableGrid<CellValue>({ columns, rows, renderCell, headerAxis, hasMinimumColumnWidths }: TableGridProps<CellValue>) {
    const headerCellScope = headerAxis === undefined ? undefined : headerCellScopeByHeaderAxis[headerAxis];

    return (
        <table className={styles.table}>
            <tbody>
                {rows.map((row, rowIndex) => (
                    <tr key={row.id} className={styles.row}>
                        {columns.map((column, columnIndex) => {
                            const cellValue = findCellValue(row, column);
                            const isCellHighlighted = row.highlighted || column.highlighted;
                            const isHeaderCell = (headerAxis === "row" && rowIndex === 0) || (headerAxis === "column" && columnIndex === 0);
                            const CellTag = isHeaderCell ? "th" : "td";

                            return (
                                <CellTag
                                    key={column.id}
                                    scope={isHeaderCell ? headerCellScope : undefined}
                                    className={clsx(
                                        styles.cell,
                                        isCellHighlighted && styles["cell--highlighted"],
                                        hasMinimumColumnWidths && minimumWidthClassByColumnSize[column.size],
                                    )}
                                >
                                    {cellValue !== undefined && <div className={styles.cell__content}>{renderCell(cellValue)}</div>}
                                </CellTag>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
