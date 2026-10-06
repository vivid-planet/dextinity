import { createTableBlock } from "@dextinity/cms-api";

import { RichTextBlock } from "./rich-text.block.js";

export const TableBlock = createTableBlock({ richText: RichTextBlock });
