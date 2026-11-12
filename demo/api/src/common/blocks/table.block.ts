import { createTableBlock } from "@dextinity/cms-api";

import { createResponsiveTableBlock } from "./table/create-responsive-table-block.js";
import { TipTapRichTextBlock } from "./tip-tap-rich-text.block.js";

const TableContentBlock = createTableBlock({ richText: TipTapRichTextBlock }, "TableContent");

export const TableBlock = createResponsiveTableBlock({ tableContentBlock: TableContentBlock, name: "Table" });
