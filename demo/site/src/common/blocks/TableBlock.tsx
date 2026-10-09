import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { TableBlockData } from "@src/blocks.generated";

import { RichTextBlock } from "./RichTextBlock";
import { TableGrid } from "./table/TableGrid";
import { TableLayout } from "./table/TableLayout";

export const TableBlock = withPreview(
    ({ data }: PropsWithData<TableBlockData>) => {
        return (
            <TableLayout>
                <TableGrid columns={data.columns} rows={data.rows} renderCell={(value) => <RichTextBlock data={value} disableLastBottomSpacing />} />
            </TableLayout>
        );
    },
    { label: "Table" },
);
