import {
    BlockData,
    BlockDataInterface,
    BlockInput,
    blockInputToData,
    ChildBlock,
    ChildBlockInput,
    createBlock,
    createOptionalBlock,
    DamImageBlock,
    ExtractBlockData,
    ExtractBlockInput,
} from "@dextinity/cms-api";
import { RichTextBlock } from "@src/common/blocks/rich-text.block";
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
