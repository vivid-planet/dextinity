import { BlockData, BlockField, BlockInput, blockInputToData, createBlock } from "@dextinity/cms-api";
import { ProductType } from "@src/products/entities/product-type.enum";
import { IsEnum } from "class-validator";

class ProductListBlockData extends BlockData {
    @BlockField({ type: "enum", enum: ProductType, array: true })
    types: ProductType[];
}

class ProductListBlockInput extends BlockInput {
    @IsEnum(ProductType, { each: true })
    @BlockField({ type: "enum", enum: ProductType, array: true })
    types: ProductType[];

    transformToBlockData(): ProductListBlockData {
        return blockInputToData(ProductListBlockData, this);
    }
}

export const ProductListBlock = createBlock(ProductListBlockData, ProductListBlockInput, "ProductList");
