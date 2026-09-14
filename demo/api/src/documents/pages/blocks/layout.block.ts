import {
    BlockData,
    BlockDataInterface,
    BlockField,
    BlockInput,
    blockInputToData,
    ChildBlock,
    ChildBlockInput,
    createBlock,
    ExtractBlockInput,
} from "@dextinity/cms-api";
import { MediaBlock } from "@src/common/blocks/media.block";
import { RichTextBlock } from "@src/common/blocks/rich-text.block";
import { IsEnum } from "class-validator";

export enum LayoutBlockLayout {
    layout1 = "layout1",
    layout2 = "layout2",
    layout3 = "layout3",
    layout4 = "layout4",
    layout5 = "layout5",
    layout6 = "layout6",
    layout7 = "layout7",
}

class LayoutBlockData extends BlockData {
    @BlockField({ type: "enum", enum: LayoutBlockLayout })
    layout: LayoutBlockLayout;

    @ChildBlock(MediaBlock)
    media1: BlockDataInterface;

    @ChildBlock(RichTextBlock)
    text1: BlockDataInterface;

    @ChildBlock(MediaBlock)
    media2: BlockDataInterface;

    @ChildBlock(RichTextBlock)
    text2: BlockDataInterface;
}

class LayoutBlockInput extends BlockInput {
    @IsEnum(LayoutBlockLayout)
    @BlockField({ type: "enum", enum: LayoutBlockLayout })
    layout: LayoutBlockLayout;

    @ChildBlockInput(MediaBlock)
    media1: ExtractBlockInput<typeof MediaBlock>;

    @ChildBlockInput(RichTextBlock)
    text1: ExtractBlockInput<typeof RichTextBlock>;

    @ChildBlockInput(MediaBlock)
    media2: ExtractBlockInput<typeof MediaBlock>;

    @ChildBlockInput(RichTextBlock)
    text2: ExtractBlockInput<typeof RichTextBlock>;

    transformToBlockData(): LayoutBlockData {
        return blockInputToData(LayoutBlockData, this);
    }
}

export const LayoutBlock = createBlock(LayoutBlockData, LayoutBlockInput, {
    name: "Layout",
});
