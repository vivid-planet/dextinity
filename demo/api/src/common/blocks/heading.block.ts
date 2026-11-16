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
import { IsEnum } from "class-validator";

import { RichTextBlock } from "./rich-text.block.js";

export enum HeadlineTag {
    h1 = "h1",
    h2 = "h2",
    h3 = "h3",
    h4 = "h4",
    h5 = "h5",
    h6 = "h6",
}

class HeadingBlockData extends BlockData {
    @ChildBlock(RichTextBlock)
    eyebrow: BlockDataInterface;

    @ChildBlock(RichTextBlock)
    headline: BlockDataInterface;

    @BlockField({ type: "enum", enum: HeadlineTag })
    htmlTag: HeadlineTag;
}

class HeadingBlockInput extends BlockInput {
    @ChildBlockInput(RichTextBlock)
    eyebrow: ExtractBlockInput<typeof RichTextBlock>;

    @ChildBlockInput(RichTextBlock)
    headline: ExtractBlockInput<typeof RichTextBlock>;

    @IsEnum(HeadlineTag)
    @BlockField({ type: "enum", enum: HeadlineTag })
    htmlTag: HeadlineTag;

    transformToBlockData(): HeadingBlockData {
        return blockInputToData(HeadingBlockData, this);
    }
}

export const HeadingBlock = createBlock(HeadingBlockData, HeadingBlockInput, "Heading");
