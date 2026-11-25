import { createTableBlock } from "@dextinity/cms-api";

import { createResponsiveTableBlock } from "./table/create-responsive-table-block.js";
import { PriceCellBlock } from "./table/price-cell.block.js";
import { TableCellRichTextBlock } from "./table/table-cell-rich-text.block.js";

const TableContentBlock = createTableBlock({ cellBlocks: { richText: TableCellRichTextBlock, price: PriceCellBlock } }, "TableContent");

export const TableBlock = createResponsiveTableBlock({ tableContentBlock: TableContentBlock, name: "Table" });
