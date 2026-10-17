import type { TableBlockData } from "@src/blocks.generated";
import clsx from "clsx";

import styles from "./ResponsiveTable.module.scss";
import type { RenderTableCell, TableColumn, TableRow } from "./tableData";
import { TableGrid } from "./TableGrid";
import { TableLayout } from "./TableLayout";

type ResponsiveTableProps<CellValue> = {
    columns: TableColumn[];
    rows: TableRow<CellValue>[];
    responsiveBehavior: TableBlockData["responsiveBehavior"];
    renderCell: RenderTableCell<CellValue>;
};

export function ResponsiveTable<CellValue>({ columns, rows, responsiveBehavior, renderCell }: ResponsiveTableProps<CellValue>) {
    if (responsiveBehavior === "none") {
        return (
            <TableLayout>
                <div className={styles.tableContainer}>
                    <TableGrid columns={columns} rows={rows} renderCell={renderCell} />
                </div>
            </TableLayout>
        );
    }

    return (
        <TableLayout>
            <div
                tabIndex={0} // Lets the keyboard scroll the table
                className={clsx(styles.tableContainer, styles["tableContainer--scrollable"])}
            >
                <TableGrid columns={columns} rows={rows} renderCell={renderCell} hasMinimumColumnWidths />
            </div>
        </TableLayout>
    );
}
