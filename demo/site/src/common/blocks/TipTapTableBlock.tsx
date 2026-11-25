import { hasTipTapRichTextContent, OneOfBlock, type PropsWithData, type SupportedBlocks, withPreview } from "@dextinity/site-nextjs";
import type { TipTapRichTextBlockData, TipTapTableBlockData } from "@src/blocks.generated";

import { DamImageBlock } from "./DamImageBlock";
import { ResponsiveTable } from "./table/ResponsiveTable";
import { TipTapRichTextBlock } from "./TipTapRichTextBlock";

type CellValue = TipTapTableBlockData["table"]["rows"][number]["cellValues"][number]["value"];

const supportedCellBlocks: SupportedBlocks = {
    richText: (data) => <TipTapRichTextBlock data={data} disableLastBottomSpacing />,
    image: (data) => <DamImageBlock data={data} sizes="(min-width: 900px) 25vw, 50vw" aspectRatio="inherit" />,
};

const renderCell = (value: CellValue) => <OneOfBlock data={value} supportedBlocks={supportedCellBlocks} />;

const hasCellContent = ({ block }: CellValue) => {
    if (block?.type === "richText") {
        return hasTipTapRichTextContent((block.props as TipTapRichTextBlockData).tipTapContent);
    }
    return block !== undefined;
};

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
