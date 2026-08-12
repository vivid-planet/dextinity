import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { ResponsiveTableBlockData } from "@src/blocks.generated";

import { TableGrid } from "./table/TableGrid";
import { TableLayout } from "./table/TableLayout";
import { TableScrollContainer } from "./table/TableScrollContainer";
import { TipTapRichTextBlock } from "./TipTapRichTextBlock";

type CellValue = ResponsiveTableBlockData["table"]["rows"][number]["cellValues"][number]["value"];

const renderCell = (value: CellValue) => <TipTapRichTextBlock data={value} disableLastBottomSpacing />;

export const ResponsiveTableBlock = withPreview(
    ({ data: { table } }: PropsWithData<ResponsiveTableBlockData>) => (
        <TableLayout>
            <TableScrollContainer>
                <TableGrid columns={table.columns} rows={table.rows} renderCell={renderCell} hasMinimumColumnWidths />
            </TableScrollContainer>
        </TableLayout>
    ),
    { label: "Table (Responsive)" },
);
