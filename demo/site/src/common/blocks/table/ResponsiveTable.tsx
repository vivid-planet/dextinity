import type { TableBlockData } from "@src/blocks.generated";

import type { RenderTableCell, TableColumn, TableRow } from "./tableData";
import { TableGrid } from "./TableGrid";
import { TableLayout } from "./TableLayout";
import { TableScrollContainer } from "./TableScrollContainer";

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
                <TableGrid columns={columns} rows={rows} renderCell={renderCell} />
            </TableLayout>
        );
    }

    return (
        <TableLayout>
            <TableScrollContainer>
                <TableGrid columns={columns} rows={rows} renderCell={renderCell} hasMinimumColumnWidths />
            </TableScrollContainer>
        </TableLayout>
    );
}
