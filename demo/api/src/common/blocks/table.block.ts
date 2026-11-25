import { createTableBlock } from "@dextinity/cms-api";

import { createResponsiveTableBlock } from "./table/create-responsive-table-block.js";
import { TableCellRichTextBlock } from "./table/table-cell-rich-text.block.js";

const TableContentBlock = createTableBlock({ richText: TableCellRichTextBlock }, "TableContent");

export const TableBlock = createResponsiveTableBlock({ tableContentBlock: TableContentBlock, name: "Table" });
