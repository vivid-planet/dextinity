import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { TableBlockData } from "@src/blocks.generated";

import { RichTextBlock } from "./RichTextBlock";
import { ResponsiveTable } from "./table/ResponsiveTable";

type CellValue = TableBlockData["table"]["rows"][number]["cellValues"][number]["value"];

const renderCell = (value: CellValue) => <RichTextBlock data={value} disableLastBottomSpacing />;

export const TableBlock = withPreview(
    ({ data: { table, responsiveBehavior } }: PropsWithData<TableBlockData>) => (
        <ResponsiveTable columns={table.columns} rows={table.rows} responsiveBehavior={responsiveBehavior} renderCell={renderCell} />
    ),
    { label: "Table" },
);
