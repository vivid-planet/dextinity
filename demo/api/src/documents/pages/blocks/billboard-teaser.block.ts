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
import { CallToActionListBlock } from "@src/common/blocks/call-to-action-list.block";
import { HeadingBlock } from "@src/common/blocks/heading.block";
import { MediaBlock } from "@src/common/blocks/media.block";
import { RichTextBlock } from "@src/common/blocks/rich-text.block";
import { IsInt, Max, Min } from "class-validator";

class BillboardTeaserBlockData extends BlockData {
    @ChildBlock(MediaBlock)
    media: BlockDataInterface;

    @ChildBlock(HeadingBlock)
    heading: BlockDataInterface;

    @ChildBlock(RichTextBlock)
    text: BlockDataInterface;

    @BlockField()
    overlay: number;

    @ChildBlock(CallToActionListBlock)
    callToActionList: BlockDataInterface;
}

class BillboardTeaserBlockInput extends BlockInput {
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

    @ChildBlockInput(CallToActionListBlock)
    callToActionList: ExtractBlockInput<typeof CallToActionListBlock>;

    transformToBlockData(): BillboardTeaserBlockData {
        return blockInputToData(BillboardTeaserBlockData, this);
    }
}

export const BillboardTeaserBlock = createBlock(BillboardTeaserBlockData, BillboardTeaserBlockInput, "BillboardTeaser");
