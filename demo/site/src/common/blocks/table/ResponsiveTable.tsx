import type { TableBlockData } from "@src/blocks.generated";
import clsx from "clsx";

import styles from "./ResponsiveTable.module.scss";
import type { RenderTableCell, TableColumn, TableRow } from "./tableData";
import { TableGrid, type TableGridProps } from "./TableGrid";
import { TableLayout } from "./TableLayout";
import { TableRecordList } from "./TableRecordList";

type ResponsiveTableProps<CellValue> = {
    columns: TableColumn[];
    rows: TableRow<CellValue>[];
    responsiveBehavior: TableBlockData["responsiveBehavior"];
    renderCell: RenderTableCell<CellValue>;
    hasCellContent: (value: CellValue) => boolean;
};

export function ResponsiveTable<CellValue>({ columns, rows, responsiveBehavior, renderCell, hasCellContent }: ResponsiveTableProps<CellValue>) {
    if (responsiveBehavior === "none") {
        return (
            <TableLayout>
                <div className={styles.tableContainer}>
                    <TableGrid columns={columns} rows={rows} renderCell={renderCell} />
                </div>
            </TableLayout>
        );
    }

    if (responsiveBehavior === "scrollSideways") {
        return (
            <TableLayout>
                <ScrollableTableGrid columns={columns} rows={rows} renderCell={renderCell} />
            </TableLayout>
        );
    }

    const headerPosition = responsiveBehavior === "listByRow" ? "firstRow" : "firstColumn";

    return (
        <TableLayout>
            <div className={styles.grid}>
                <ScrollableTableGrid columns={columns} rows={rows} renderCell={renderCell} headerPosition={headerPosition} />
            </div>
            <div className={clsx(styles.tableContainer, styles.recordList)}>
                <TableRecordList
                    columns={columns}
                    rows={rows}
                    headerPosition={headerPosition}
                    renderCell={renderCell}
                    hasCellContent={hasCellContent}
                />
            </div>
        </TableLayout>
    );
}

function ScrollableTableGrid<CellValue>(props: TableGridProps<CellValue>) {
    return (
        <div
            tabIndex={0} // Lets the keyboard scroll the table
            className={clsx(styles.tableContainer, styles["tableContainer--scrollable"])}
        >
            <TableGrid {...props} hasMinimumColumnWidths />
        </div>
    );
}
