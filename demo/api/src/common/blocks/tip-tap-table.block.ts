import { createTableBlock } from "@dextinity/cms-api";

import { TipTapRichTextBlock } from "./tip-tap-rich-text.block.js";

export const TipTapTableBlock = createTableBlock({ richText: TipTapRichTextBlock }, "TipTapTable");
