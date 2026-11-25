import { createTableBlock } from "@dextinity/cms-api";

import { createResponsiveTableBlock } from "./table/create-responsive-table-block.js";
import { PriceCellBlock } from "./table/price-cell.block.js";
import { TextCellBlock } from "./table/text-cell.block.js";

const TableContentBlock = createTableBlock({ cellBlocks: { text: TextCellBlock, price: PriceCellBlock } }, "TableContent");

export const TableBlock = createResponsiveTableBlock({ tableContentBlock: TableContentBlock, name: "Table" });
