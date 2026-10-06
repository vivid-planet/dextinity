import { createBlocksBlock, DamImageBlock } from "@dextinity/cms-api";
import { HeadingBlock } from "@src/common/blocks/heading.block.js";
import { RichTextBlock } from "@src/common/blocks/rich-text.block.js";
import { TextImageBlock } from "@src/common/blocks/text-image.block.js";

export const NewsContentBlock = createBlocksBlock(
    {
        supportedBlocks: {
            headline: HeadingBlock,
            richText: RichTextBlock,
            image: DamImageBlock,
            textImage: TextImageBlock,
        },
    },
    { name: "NewsContent" },
);
