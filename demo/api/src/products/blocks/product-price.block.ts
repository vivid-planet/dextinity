import {
    AnnotationBlockMeta,
    BlockData,
    BlockField,
    BlockIndexData,
    BlockInput,
    blockInputToData,
    BlockMetaField,
    BlockMetaFieldKind,
    createBlock,
    IsUndefinable,
} from "@dextinity/cms-api";
import { IsUUID } from "class-validator";

import { ProductPriceBlockTransformerService } from "./product-price-block-transformer.service";

class ProductPriceBlockData extends BlockData {
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

    async transformToPlain() {
        return ProductPriceBlockTransformerService;
    }
}

class Meta extends AnnotationBlockMeta {
    get fields(): BlockMetaField[] {
        return [
            ...super.fields,
            {
                name: "product",
                kind: BlockMetaFieldKind.NestedObject,
                nullable: true,
                object: {
                    fields: [
                        {
                            name: "id",
                            kind: BlockMetaFieldKind.String,
                            nullable: false,
                        },
                        {
                            name: "title",
                            kind: BlockMetaFieldKind.String,
                            nullable: false,
                        },
                        {
                            name: "price",
                            kind: BlockMetaFieldKind.Number,
                            nullable: true,
                        },
                    ],
                },
            },
        ];
    }
}

class ProductPriceBlockInput extends BlockInput {
    @BlockField({ nullable: true })
    @IsUUID()
    @IsUndefinable()
    productId?: string;

    transformToBlockData(): ProductPriceBlockData {
        return blockInputToData(ProductPriceBlockData, this);
    }
}

const ProductPriceBlock = createBlock(ProductPriceBlockData, ProductPriceBlockInput, {
    name: "ProductPrice",
    blockMeta: new Meta(ProductPriceBlockData),
});

export { ProductPriceBlock, ProductPriceBlockData };
