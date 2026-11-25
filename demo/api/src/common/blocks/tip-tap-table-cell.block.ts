import { createOneOfBlock, DamImageBlock } from "@dextinity/cms-api";

import { TipTapRichTextBlock } from "./tip-tap-rich-text.block";

export const TipTapTableCellBlock = createOneOfBlock(
    {
        supportedBlocks: { richText: TipTapRichTextBlock, image: DamImageBlock },
        allowEmpty: false,
    },
    "TipTapTableCell",
);
