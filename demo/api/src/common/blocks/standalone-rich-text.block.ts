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
import { IsEnum } from "class-validator";

import { RichTextBlock } from "./rich-text.block";

export enum TextAlignment {
    left = "left",
    center = "center",
    right = "right",
    justify = "justify",
}

class StandaloneRichTextBlockData extends BlockData {
    @ChildBlock(RichTextBlock)
    richText: BlockDataInterface;

    @BlockField({ type: "enum", enum: TextAlignment })
    textAlignment: TextAlignment;
}

class StandaloneRichTextBlockInput extends BlockInput {
    @ChildBlockInput(RichTextBlock)
    richText: ExtractBlockInput<typeof RichTextBlock>;

    @IsEnum(TextAlignment)
    @BlockField({ type: "enum", enum: TextAlignment })
    textAlignment: TextAlignment;

    transformToBlockData(): StandaloneRichTextBlockData {
        return blockInputToData(StandaloneRichTextBlockData, this);
    }
}

export const StandaloneRichTextBlock = createBlock(StandaloneRichTextBlockData, StandaloneRichTextBlockInput, {
    name: "StandaloneRichText",
});
