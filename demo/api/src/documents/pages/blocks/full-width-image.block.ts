import {
    BlockData,
    type BlockDataInterface,
    BlockInput,
    blockInputToData,
    ChildBlock,
    ChildBlockInput,
    createBlock,
    createOptionalBlock,
    DamImageBlock,
    type ExtractBlockData,
    type ExtractBlockInput,
} from "@dextinity/cms-api";
import { TipTapRichTextBlock } from "@src/common/blocks/tip-tap-rich-text.block.js";

const FullWidthImageContentBlock = createOptionalBlock(TipTapRichTextBlock);

class FullWidthImageBlockData extends BlockData {
    @ChildBlock(DamImageBlock)
    image: ExtractBlockData<typeof DamImageBlock>;

    @ChildBlock(FullWidthImageContentBlock)
    content: ExtractBlockData<typeof FullWidthImageContentBlock>;
}

class FullWidthImageBlockInput extends BlockInput {
    @ChildBlockInput(DamImageBlock)
    image: ExtractBlockInput<typeof DamImageBlock>;

    @ChildBlockInput(FullWidthImageContentBlock)
    content: ExtractBlockInput<typeof FullWidthImageContentBlock>;

    transformToBlockData(): BlockDataInterface {
        return blockInputToData(FullWidthImageBlockData, this);
    }
}

export const FullWidthImageBlock = createBlock(FullWidthImageBlockData, FullWidthImageBlockInput, "FullWidthImage");
