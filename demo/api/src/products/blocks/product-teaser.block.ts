import { BlockData, BlockField, BlockIndexData, BlockInput, blockInputToData, createBlock, IsUndefinable } from "@dextinity/cms-api";
import { IsUUID } from "class-validator";

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
    @IsUndefinable()
    productId?: string;

    transformToBlockData(): ProductTeaserBlockData {
        return blockInputToData(ProductTeaserBlockData, this);
    }
}

const ProductTeaserBlock = createBlock(ProductTeaserBlockData, ProductTeaserBlockInput, {
    name: "ProductTeaser",
    description: "A teaser for a single product.",
});

export { ProductTeaserBlock };
