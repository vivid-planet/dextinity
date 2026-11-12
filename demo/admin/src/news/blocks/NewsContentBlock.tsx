import { createBlocksBlock, DamImageBlock } from "@dextinity/cms-admin";
import { HeadingBlock } from "@src/common/blocks/HeadingBlock";
import { TextImageBlock } from "@src/common/blocks/TextImageBlock";
import { TipTapRichTextBlock } from "@src/common/blocks/TipTapRichTextBlock";

export const NewsContentBlock = createBlocksBlock({
    name: "NewsContentBlock",
    supportedBlocks: {
        heading: HeadingBlock,
        richText: TipTapRichTextBlock,
        image: DamImageBlock,
        textImage: TextImageBlock,
    },
});
