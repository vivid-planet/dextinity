import { hasTipTapRichTextContent, OneOfBlock, type PropsWithData, type SupportedBlocks, withPreview } from "@dextinity/site-nextjs";
import type { TableBlockData } from "@src/blocks.generated";

import { RichTextBlock } from "./RichTextBlock";
import { PriceCellBlock } from "./table/PriceCellBlock";
import { ResponsiveTable } from "./table/ResponsiveTable";

type CellValue = TableBlockData["table"]["rows"][number]["cellValues"][number]["value"];

const supportedCellBlocks: SupportedBlocks = {
    richText: (data) => <RichTextBlock data={data} disableLastBottomSpacing />,
    price: (data) => <PriceCellBlock data={data} />,
};

const renderCell = (value: CellValue) => <OneOfBlock data={value} supportedBlocks={supportedCellBlocks} />;

const hasCellContent = ({ block }: CellValue) => {
    if (!block) {
        return false;
    }

    if ("tipTapContent" in block.props) {
        return hasTipTapRichTextContent(block.props.tipTapContent);
    }

    // A price cell without an amount shows a dash
    return true;
};

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
