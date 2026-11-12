import {
    BlockData,
    type BlockDataInterface,
    BlockField,
    BlockInput,
    blockInputToData,
    ChildBlock,
    ChildBlockInput,
    createBlock,
    type ExtractBlockInput,
    SvgImageBlock,
} from "@dextinity/cms-api";
import { InlineTipTapRichTextBlock } from "@src/common/blocks/inline-tip-tap-rich-text.block.js";
import { IsString } from "class-validator";

class KeyFactsItemBlockData extends BlockData {
    @ChildBlock(SvgImageBlock)
    icon: BlockDataInterface;

    @BlockField()
    fact: string;

    @BlockField()
    label: string;

    @ChildBlock(InlineTipTapRichTextBlock)
    description: BlockDataInterface;
}

class KeyFactsItemBlockInput extends BlockInput {
    @ChildBlockInput(SvgImageBlock)
    icon: ExtractBlockInput<typeof SvgImageBlock>;

    @BlockField()
    @IsString()
    fact: string;

    @BlockField()
    @IsString()
    label: string;

    @ChildBlockInput(InlineTipTapRichTextBlock)
    description: ExtractBlockInput<typeof InlineTipTapRichTextBlock>;

    transformToBlockData(): KeyFactsItemBlockData {
        return blockInputToData(KeyFactsItemBlockData, this);
    }
}

export const KeyFactsItemBlock = createBlock(KeyFactsItemBlockData, KeyFactsItemBlockInput, "KeyFactsItem");
