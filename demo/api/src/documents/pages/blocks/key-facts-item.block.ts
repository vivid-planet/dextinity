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
import { DescriptionRichTextBlock } from "@src/common/blocks/description-rich-text.block.js";
import { IsString } from "class-validator";

class KeyFactsItemBlockData extends BlockData {
    @ChildBlock(SvgImageBlock)
    icon: BlockDataInterface;

    @BlockField()
    fact: string;

    @BlockField()
    label: string;

    @ChildBlock(DescriptionRichTextBlock)
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

    @ChildBlockInput(DescriptionRichTextBlock)
    description: ExtractBlockInput<typeof DescriptionRichTextBlock>;

    transformToBlockData(): KeyFactsItemBlockData {
        return blockInputToData(KeyFactsItemBlockData, this);
    }
}

export const KeyFactsItemBlock = createBlock(KeyFactsItemBlockData, KeyFactsItemBlockInput, "KeyFactsItem");
