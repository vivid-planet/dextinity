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
import { RichTextBlock } from "@src/common/blocks/rich-text.block.js";
import { ValidateNested } from "class-validator";

const FullWidthImageContentBlock = createOptionalBlock(RichTextBlock);

class FullWidthImageBlockData extends BlockData {
    @ChildBlock(DamImageBlock)
    image: ExtractBlockData<typeof DamImageBlock>;

    @ChildBlock(FullWidthImageContentBlock)
    content: ExtractBlockData<typeof FullWidthImageContentBlock>;
}

class FullWidthImageBlockInput extends BlockInput {
    @ChildBlockInput(DamImageBlock)
    @ValidateNested()
    image: ExtractBlockInput<typeof DamImageBlock>;

    @ChildBlockInput(FullWidthImageContentBlock)
    @ValidateNested()
    content: ExtractBlockInput<typeof FullWidthImageContentBlock>;

    transformToBlockData(): BlockDataInterface {
        return blockInputToData(FullWidthImageBlockData, this);
    }
}

export const FullWidthImageBlock = createBlock(FullWidthImageBlockData, FullWidthImageBlockInput, "FullWidthImage");
