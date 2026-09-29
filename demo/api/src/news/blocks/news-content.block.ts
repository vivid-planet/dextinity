import { createBlocksBlock, DamImageBlock } from "@dextinity/cms-api";
import { HeadingBlock } from "@src/common/blocks/heading.block";
import { RichTextBlock } from "@src/common/blocks/rich-text.block";
import { TextImageBlock } from "@src/common/blocks/text-image.block";

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
