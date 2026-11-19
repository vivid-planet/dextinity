import { hasTipTapRichTextContent, type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { TipTapTableBlockData } from "@src/blocks.generated";

import { ResponsiveTable } from "./table/ResponsiveTable";
import { TipTapRichTextBlock } from "./TipTapRichTextBlock";

type CellValue = TipTapTableBlockData["table"]["rows"][number]["cellValues"][number]["value"];

const renderCell = (value: CellValue) => <TipTapRichTextBlock data={value} disableLastBottomSpacing />;

const hasCellContent = (value: CellValue) => hasTipTapRichTextContent(value.tipTapContent);

export const TipTapTableBlock = withPreview(
    ({ data: { table, responsiveBehavior } }: PropsWithData<TipTapTableBlockData>) => (
        <ResponsiveTable
            columns={table.columns}
            rows={table.rows}
            responsiveBehavior={responsiveBehavior}
            renderCell={renderCell}
            hasCellContent={hasCellContent}
        />
    ),
    { label: "TipTap Table" },
);
