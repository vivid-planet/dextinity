import { createTableBlock } from "@dextinity/cms-api";

import { RichTextBlock } from "./rich-text.block";
import { createTableBlockWithResponsiveBehavior } from "./table/create-table-block-with-responsive-behavior";

const TableContentBlock = createTableBlock({ richText: RichTextBlock }, "TableContent");

export const TableBlock = createTableBlockWithResponsiveBehavior({ tableContentBlock: TableContentBlock, name: "Table" });
