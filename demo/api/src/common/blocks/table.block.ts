import { createTableBlock } from "@dextinity/cms-api";

import { RichTextBlock } from "./rich-text.block";
import { createResponsiveTableBlock } from "./table/create-responsive-table-block";

const TableContentBlock = createTableBlock({ richText: RichTextBlock }, "TableContent");

export const TableBlock = createResponsiveTableBlock({ tableContentBlock: TableContentBlock, name: "Table" });
