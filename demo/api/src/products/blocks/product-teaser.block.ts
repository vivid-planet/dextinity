import { BlockData, BlockField, BlockIndexData, BlockInput, blockInputToData, createBlock } from "@dextinity/cms-api";
import { IsOptional, IsUUID } from "class-validator";

class ProductTeaserBlockData extends BlockData {
    @BlockField({ type: "string", nullable: true })
    productId?: string | null;

    indexData(): BlockIndexData {
        if (!this.productId) {
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
    @BlockField({ type: "string", nullable: true })
    @IsUUID()
    @IsOptional()
    productId?: string | null;

    transformToBlockData(): ProductTeaserBlockData {
        return blockInputToData(ProductTeaserBlockData, this);
    }
}

const ProductTeaserBlock = createBlock(ProductTeaserBlockData, ProductTeaserBlockInput, {
    name: "ProductTeaser",
    description: "A teaser for a single product.",
});

export { ProductTeaserBlock };
