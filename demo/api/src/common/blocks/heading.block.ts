import {
    BlockData,
    type BlockDataInterface,
    BlockInput,
    blockInputToData,
    ChildBlock,
    ChildBlockInput,
    createBlock,
    type ExtractBlockInput,
} from "@dextinity/cms-api";

import { EyebrowRichTextBlock } from "./eyebrow-rich-text.block.js";
import { HeadlineRichTextBlock } from "./headline-rich-text.block.js";

class HeadingBlockData extends BlockData {
    @ChildBlock(EyebrowRichTextBlock)
    eyebrow: BlockDataInterface;

    @ChildBlock(HeadlineRichTextBlock)
    headline: BlockDataInterface;
}

class HeadingBlockInput extends BlockInput {
    @ChildBlockInput(EyebrowRichTextBlock)
    eyebrow: ExtractBlockInput<typeof EyebrowRichTextBlock>;

    @ChildBlockInput(HeadlineRichTextBlock)
    headline: ExtractBlockInput<typeof HeadlineRichTextBlock>;

    transformToBlockData(): HeadingBlockData {
        return blockInputToData(HeadingBlockData, this);
    }
}

export const HeadingBlock = createBlock(HeadingBlockData, HeadingBlockInput, "Heading");
