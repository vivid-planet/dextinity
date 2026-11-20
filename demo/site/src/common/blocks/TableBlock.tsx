import { hasTipTapRichTextContent, type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { TableBlockData } from "@src/blocks.generated";

import { RichTextBlock } from "./RichTextBlock";
import { ResponsiveTable } from "./table/ResponsiveTable";

type CellValue = TableBlockData["table"]["rows"][number]["cellValues"][number]["value"];

const renderCell = (value: CellValue) => <RichTextBlock data={value} disableLastBottomSpacing />;

const hasCellContent = (value: CellValue) => hasTipTapRichTextContent(value.tipTapContent);

export const TableBlock = withPreview(
    ({ data: { table, responsiveBehavior } }: PropsWithData<TableBlockData>) => (
        <ResponsiveTable
            columns={table.columns}
            rows={table.rows}
            responsiveBehavior={responsiveBehavior}
            renderCell={renderCell}
            hasCellContent={hasCellContent}
        />
    ),
    { label: "Table" },
);
