import { BlockData, BlockField, BlockIndexData, BlockInput, blockInputToData, createBlock } from "@dextinity/cms-api";
import { IsOptional, IsUUID } from "class-validator";

class ProductDetailBlockData extends BlockData {
    @BlockField({ nullable: true })
    id?: string;

    indexData(): BlockIndexData {
        if (this.id === undefined) {
            return {};
        }

        return {
            dependencies: [
                {
                    targetEntityName: "Product",
                    id: this.id,
                },
            ],
        };
    }
}

class ProductDetailBlockInput extends BlockInput {
    @BlockField({ nullable: true })
    @IsUUID()
    @IsOptional()
    id?: string;

    transformToBlockData(): ProductDetailBlockData {
        return blockInputToData(ProductDetailBlockData, this);
    }
}

const ProductDetailBlock = createBlock(ProductDetailBlockData, ProductDetailBlockInput, "ProductDetail");

export { ProductDetailBlock };
