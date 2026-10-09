import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { TipTapTableBlockData } from "@src/blocks.generated";

import { ResponsiveTable } from "./table/ResponsiveTable";
import { TipTapRichTextBlock } from "./TipTapRichTextBlock";

type CellValue = TipTapTableBlockData["table"]["rows"][number]["cellValues"][number]["value"];

const renderCell = (value: CellValue) => <TipTapRichTextBlock data={value} disableLastBottomSpacing />;

export const TipTapTableBlock = withPreview(
    ({ data: { table, responsiveBehavior } }: PropsWithData<TipTapTableBlockData>) => (
        <ResponsiveTable columns={table.columns} rows={table.rows} responsiveBehavior={responsiveBehavior} renderCell={renderCell} />
    ),
    { label: "TipTap Table" },
);
