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
} from "@dextinity/cms-api";
import { CallToActionListBlock } from "@src/common/blocks/call-to-action-list.block.js";
import { HeadingBlock } from "@src/common/blocks/heading.block.js";
import { MediaBlock } from "@src/common/blocks/media.block.js";
import { RichTextBlock } from "@src/common/blocks/rich-text.block.js";
import { IsEnum, IsInt, Max, Min } from "class-validator";

export enum Alignment {
    left = "left",
    center = "center",
}

class BasicStageBlockData extends BlockData {
    @ChildBlock(MediaBlock)
    media: BlockDataInterface;

    @ChildBlock(HeadingBlock)
    heading: BlockDataInterface;

    @ChildBlock(RichTextBlock)
    text: BlockDataInterface;

    @BlockField()
    overlay: number;

    @BlockField({ type: "enum", enum: Alignment })
    alignment: Alignment;

    @ChildBlock(CallToActionListBlock)
    callToActionList: BlockDataInterface;
}

class BasicStageBlockInput extends BlockInput {
    @ChildBlockInput(MediaBlock)
    media: ExtractBlockInput<typeof MediaBlock>;

    @ChildBlockInput(HeadingBlock)
    heading: ExtractBlockInput<typeof HeadingBlock>;

    @ChildBlockInput(RichTextBlock)
    text: ExtractBlockInput<typeof RichTextBlock>;

    @BlockField()
    @IsInt()
    @Min(0)
    @Max(90)
    overlay: number;

    @IsEnum(Alignment)
    @BlockField({ type: "enum", enum: Alignment })
    alignment: Alignment;

    @ChildBlockInput(CallToActionListBlock)
    callToActionList: ExtractBlockInput<typeof CallToActionListBlock>;

    transformToBlockData(): BasicStageBlockData {
        return blockInputToData(BasicStageBlockData, this);
    }
}

export const BasicStageBlock = createBlock(BasicStageBlockData, BasicStageBlockInput, "BasicStage");
