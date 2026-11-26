import { BlockData, BlockField, BlockInput, blockInputToData, createBlock } from "@dextinity/cms-api";
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional } from "class-validator";

import { TableCellBadge } from "./table-cell-badge.enum.js";

class PriceCellBlockData extends BlockData {
    @BlockField({ type: "number", nullable: true })
    amount?: number;

    @BlockField()
    bold: boolean;

    @BlockField({ type: "enum", enum: TableCellBadge, array: true })
    badges: TableCellBadge[];
}

class PriceCellBlockInput extends BlockInput {
    // Inactive cell types are validated too, so a cell switched to a price and back must still save with an empty price
    @IsOptional()
    @IsNumber()
    @BlockField({ type: "number", nullable: true })
    amount?: number;

    @IsBoolean()
    @BlockField()
    bold: boolean;

    @IsArray()
    @IsEnum(TableCellBadge, { each: true })
    @BlockField({ type: "enum", enum: TableCellBadge, array: true })
    badges: TableCellBadge[];

    transformToBlockData(): PriceCellBlockData {
        return blockInputToData(PriceCellBlockData, this);
    }
}

export const PriceCellBlock = createBlock(PriceCellBlockData, PriceCellBlockInput, "PriceCell");
