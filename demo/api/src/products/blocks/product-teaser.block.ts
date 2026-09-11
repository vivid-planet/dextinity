import { BlockData, BlockField, BlockIndexData, BlockInput, blockInputToData, createBlock } from "@dextinity/cms-api";
import { IsOptional, IsUUID } from "class-validator";

class ProductTeaserBlockData extends BlockData {
    @BlockField({ nullable: true })
    productId?: string;

    indexData(): BlockIndexData {
        if (this.productId === undefined) {
            return {};
        }

        return {
            dependencies: [
                {
                    targetEntityName: "Product",
                    id: this.productId,
                },
            ],
        };
    }
}

class ProductTeaserBlockInput extends BlockInput {
    @BlockField({ nullable: true })
    @IsUUID()
    @IsOptional()
    productId?: string;

    transformToBlockData(): ProductTeaserBlockData {
        return blockInputToData(ProductTeaserBlockData, this);
    }
}

const ProductTeaserBlock = createBlock(ProductTeaserBlockData, ProductTeaserBlockInput, "ProductTeaser");

export { ProductTeaserBlock };
