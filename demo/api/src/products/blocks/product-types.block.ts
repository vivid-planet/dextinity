import { BlockData, BlockField, BlockInput, blockInputToData, createBlock } from "@dextinity/cms-api";
import { ProductType } from "@src/products/entities/product-type.enum";
import { IsEnum } from "class-validator";

class ProductTypesBlockData extends BlockData {
    @BlockField({ type: "enum", enum: ProductType, array: true })
    types: ProductType[];
}

class ProductTypesBlockInput extends BlockInput {
    @IsEnum(ProductType, { each: true })
    @BlockField({ type: "enum", enum: ProductType, array: true })
    types: ProductType[];

    transformToBlockData(): ProductTypesBlockData {
        return blockInputToData(ProductTypesBlockData, this);
    }
}

export const ProductTypesBlock = createBlock(ProductTypesBlockData, ProductTypesBlockInput, "ProductTypes");
