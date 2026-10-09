import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { TableBlockData } from "@src/blocks.generated";

import { RichTextBlock } from "./RichTextBlock";
import { TableGrid } from "./table/TableGrid";
import { TableLayout } from "./table/TableLayout";

export const TableBlock = withPreview(
    ({ data: { table } }: PropsWithData<TableBlockData>) => {
        return (
            <TableLayout>
                <TableGrid columns={table.columns} rows={table.rows} renderCell={(value) => <RichTextBlock data={value} disableLastBottomSpacing />} />
            </TableLayout>
        );
    },
    { label: "Table" },
);
