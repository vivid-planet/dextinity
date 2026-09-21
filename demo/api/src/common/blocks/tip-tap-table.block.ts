import { createTableBlock } from "@dextinity/cms-api";

import { TipTapRichTextBlock } from "./tip-tap-rich-text.block";

export const TipTapTableBlock = createTableBlock(
    { richText: TipTapRichTextBlock },
    { name: "TipTapTable", description: "A table whose cells contain TipTap rich text." },
);
