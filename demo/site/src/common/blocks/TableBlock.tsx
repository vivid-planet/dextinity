import { hasTipTapRichTextContent, OneOfBlock, type PropsWithData, type SupportedBlocks, withPreview } from "@dextinity/site-nextjs";
import type { TableBlockData } from "@src/blocks.generated";

import { PriceCellBlock } from "./table/PriceCellBlock";
import { ResponsiveTable } from "./table/ResponsiveTable";
import { TextCellBlock } from "./table/TextCellBlock";

type CellValue = TableBlockData["table"]["rows"][number]["cellValues"][number]["value"];

const supportedCellBlocks: SupportedBlocks = {
    text: (data) => <TextCellBlock data={data} />,
    price: (data) => <PriceCellBlock data={data} />,
};

const renderCell = (value: CellValue) => <OneOfBlock data={value} supportedBlocks={supportedCellBlocks} />;

const hasCellContent = ({ block }: CellValue) => {
    if (!block) {
        return false;
    }

    if ("text" in block.props) {
        return block.props.badges.length > 0 || hasTipTapRichTextContent(block.props.text.tipTapContent);
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
