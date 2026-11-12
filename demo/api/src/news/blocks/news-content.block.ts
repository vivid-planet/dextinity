import { createBlocksBlock, DamImageBlock } from "@dextinity/cms-api";
import { HeadingBlock } from "@src/common/blocks/heading.block.js";
import { TextImageBlock } from "@src/common/blocks/text-image.block.js";
import { TipTapRichTextBlock } from "@src/common/blocks/tip-tap-rich-text.block.js";

export const NewsContentBlock = createBlocksBlock(
    {
        supportedBlocks: {
            headline: HeadingBlock,
            richText: TipTapRichTextBlock,
            image: DamImageBlock,
            textImage: TextImageBlock,
        },
    },
    "NewsContent",
);
