import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { TipTapTableBlockData } from "@src/blocks.generated";

import { TableGrid } from "./table/TableGrid";
import { TableLayout } from "./table/TableLayout";
import { TipTapRichTextBlock } from "./TipTapRichTextBlock";

export const TipTapTableBlock = withPreview(
    ({ data: { table } }: PropsWithData<TipTapTableBlockData>) => {
        return (
            <TableLayout>
                <TableGrid
                    columns={table.columns}
                    rows={table.rows}
                    renderCell={(value) => <TipTapRichTextBlock data={value} disableLastBottomSpacing />}
                />
            </TableLayout>
        );
    },
    { label: "TipTap Table" },
);
