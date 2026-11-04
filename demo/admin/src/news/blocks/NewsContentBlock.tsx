import { createBlocksBlock, DamImageBlock } from "@dextinity/cms-admin";
import { HeadingBlock } from "@src/common/blocks/HeadingBlock";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { TextImageBlock } from "@src/common/blocks/TextImageBlock";

export const NewsContentBlock = createBlocksBlock({
    name: "NewsContentBlock",
    supportedBlocks: {
        heading: HeadingBlock,
        richText: RichTextBlock,
        image: DamImageBlock,
        textImage: TextImageBlock,
    },
});
