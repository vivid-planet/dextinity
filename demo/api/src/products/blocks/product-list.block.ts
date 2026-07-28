import { BlockData, BlockField, BlockInput, blockInputToData, createBlock } from "@dextinity/cms-api";
import { IsUUID } from "class-validator";

class ProductListBlockData extends BlockData {
    @BlockField({ type: "string", array: true })
    ids: string[];
}

class ProductListBlockInput extends BlockInput {
    @BlockField({ type: "string", array: true })
    @IsUUID(undefined, { each: true })
    ids: string[];

    transformToBlockData(): ProductListBlockData {
        return blockInputToData(ProductListBlockData, this);
    }
}

export const ProductListBlock = createBlock(ProductListBlockData, ProductListBlockInput, "ProductList");
