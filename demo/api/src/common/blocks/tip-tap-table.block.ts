import { createTableBlock } from "@dextinity/cms-api";

import { TipTapRichTextBlock } from "./tip-tap-rich-text.block";

export const TipTapTableBlock = createTableBlock({ richText: TipTapRichTextBlock }, "TipTapTable");
