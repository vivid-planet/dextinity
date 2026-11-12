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

import { TipTapRichTextBlock } from "./tip-tap-rich-text.block.js";

export enum TextAlignment {
    left = "left",
    center = "center",
    right = "right",
    justify = "justify",
}

class StandaloneRichTextBlockData extends BlockData {
    @ChildBlock(TipTapRichTextBlock)
    richText: BlockDataInterface;

    @BlockField({ type: "enum", enum: TextAlignment })
    textAlignment: TextAlignment;
}

class StandaloneRichTextBlockInput extends BlockInput {
    @ChildBlockInput(TipTapRichTextBlock)
    richText: ExtractBlockInput<typeof TipTapRichTextBlock>;

    @IsEnum(TextAlignment)
    @BlockField({ type: "enum", enum: TextAlignment })
    textAlignment: TextAlignment;

    transformToBlockData(): StandaloneRichTextBlockData {
        return blockInputToData(StandaloneRichTextBlockData, this);
    }
}

export const StandaloneRichTextBlock = createBlock(StandaloneRichTextBlockData, StandaloneRichTextBlockInput, "StandaloneRichText");
