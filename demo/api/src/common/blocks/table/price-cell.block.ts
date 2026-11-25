import { BlockData, BlockField, BlockInput, blockInputToData, createBlock } from "@dextinity/cms-api";
import { IsBoolean, IsNumber, IsOptional } from "class-validator";

class PriceCellBlockData extends BlockData {
    @BlockField({ type: "number", nullable: true })
    amount?: number;

    @BlockField()
    bold: boolean;
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

    transformToBlockData(): PriceCellBlockData {
        return blockInputToData(PriceCellBlockData, this);
    }
}

export const PriceCellBlock = createBlock(PriceCellBlockData, PriceCellBlockInput, "PriceCell");
