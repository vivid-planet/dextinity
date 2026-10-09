import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { ResponsiveTableBlockData } from "@src/blocks.generated";

import styles from "./ResponsiveTableBlock.module.scss";
import { convertTableDataToRecordList } from "./table/convertTableDataToRecordList";
import type { TableHeaderAxis } from "./table/tableData";
import { TableGrid } from "./table/TableGrid";
import { TableLayout } from "./table/TableLayout";
import { TableRecordList } from "./table/TableRecordList";
import { TableScrollContainer } from "./table/TableScrollContainer";
import { TipTapRichTextBlock } from "./TipTapRichTextBlock";

type CellValue = ResponsiveTableBlockData["table"]["rows"][number]["cellValues"][number]["value"];

const headerAxisByResponsiveBehavior: Record<ResponsiveTableBlockData["responsiveBehavior"], TableHeaderAxis | undefined> = {
    horizontalScrolling: undefined,
    headerRow: "row",
    headerColumn: "column",
};

const renderCell = (value: CellValue) => <TipTapRichTextBlock data={value} disableLastBottomSpacing />;

export const ResponsiveTableBlock = withPreview(
    ({ data: { table, responsiveBehavior } }: PropsWithData<ResponsiveTableBlockData>) => {
        const headerAxis = headerAxisByResponsiveBehavior[responsiveBehavior];
        const records = headerAxis === undefined ? [] : convertTableDataToRecordList({ columns: table.columns, rows: table.rows, headerAxis });

        const grid = (
            <TableScrollContainer>
                <TableGrid columns={table.columns} rows={table.rows} renderCell={renderCell} headerAxis={headerAxis} hasMinimumColumnWidths />
            </TableScrollContainer>
        );

        // A table whose header cells are its only row or column has no records to list.
        if (records.length === 0) {
            return <TableLayout>{grid}</TableLayout>;
        }

        return (
            <TableLayout>
                <div className={styles.grid}>{grid}</div>
                <div className={styles.recordList}>
                    <TableRecordList records={records} renderCell={renderCell} />
                </div>
            </TableLayout>
        );
    },
    { label: "Table (Responsive)" },
);
