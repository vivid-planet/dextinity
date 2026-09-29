import { createTableBlock } from "@dextinity/cms-api";

import { RichTextBlock } from "./rich-text.block";

export const TableBlock = createTableBlock({ richText: RichTextBlock });
