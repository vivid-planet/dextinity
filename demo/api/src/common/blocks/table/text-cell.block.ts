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
import { IsArray, IsEnum } from "class-validator";

import { TableCellBadge } from "./table-cell-badge.enum.js";
import { TableCellRichTextBlock } from "./table-cell-rich-text.block.js";

class TextCellBlockData extends BlockData {
    @ChildBlock(TableCellRichTextBlock)
    text: BlockDataInterface;

    @BlockField({ type: "enum", enum: TableCellBadge, array: true })
    badges: TableCellBadge[];
}

class TextCellBlockInput extends BlockInput {
    @ChildBlockInput(TableCellRichTextBlock)
    text: ExtractBlockInput<typeof TableCellRichTextBlock>;

    @IsArray()
    @IsEnum(TableCellBadge, { each: true })
    @BlockField({ type: "enum", enum: TableCellBadge, array: true })
    badges: TableCellBadge[];

    transformToBlockData(): TextCellBlockData {
        return blockInputToData(TextCellBlockData, this);
    }
}

export const TextCellBlock = createBlock(TextCellBlockData, TextCellBlockInput, "TextCell");
