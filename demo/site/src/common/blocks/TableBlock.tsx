import { hasTipTapRichTextContent, OneOfBlock, type PropsWithData, type SupportedBlocks, withPreview } from "@dextinity/site-nextjs";
import type { DamImageBlockData, TableBlockData, TextCellBlockData } from "@src/blocks.generated";

import { ImageCellBlock } from "./table/ImageCellBlock";
import { PriceCellBlock } from "./table/PriceCellBlock";
import { ResponsiveTable } from "./table/ResponsiveTable";
import type { RenderTableCell, TableColumn } from "./table/tableData";
import { TextCellBlock } from "./table/TextCellBlock";

type CellValue = TableBlockData["table"]["rows"][number]["cellValues"][number]["value"];

const getSupportedCellBlocks = (column: TableColumn): SupportedBlocks => ({
    text: (data) => <TextCellBlock data={data} />,
    price: (data) => <PriceCellBlock data={data} />,
    image: (data) => <ImageCellBlock data={data} columnSize={column.size} />,
});

const renderCell: RenderTableCell<CellValue> = (value, column) => <OneOfBlock data={value} supportedBlocks={getSupportedCellBlocks(column)} />;

const hasCellContent = ({ block }: CellValue) => {
    if (block?.type === "text") {
        const { text, badges } = block.props as TextCellBlockData;
        return badges.length > 0 || hasTipTapRichTextContent(text.tipTapContent);
    }

    if (block?.type === "image") {
        return (block.props as DamImageBlockData).block?.props.damFile != null;
    }

    // A price cell without an amount shows a dash
    return block?.type === "price";
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
