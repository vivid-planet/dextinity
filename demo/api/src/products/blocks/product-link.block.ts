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
} from "@dextinity/cms-api";
import { IsOptional, IsUUID } from "class-validator";

import { ProductLinkBlockTransformerService } from "./product-link-block-transformer.service";

class ProductLinkBlockData extends BlockData {
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

    async transformToPlain() {
        return ProductLinkBlockTransformerService;
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
                            name: "slug",
                            kind: BlockMetaFieldKind.String,
                            nullable: false,
                        },
                    ],
                },
            },
        ];
    }
}

class ProductLinkBlockInput extends BlockInput {
    @BlockField({ nullable: true })
    @IsUUID()
    @IsOptional()
    id?: string;

    transformToBlockData(): ProductLinkBlockData {
        return blockInputToData(ProductLinkBlockData, this);
    }
}

const ProductLinkBlock = createBlock(ProductLinkBlockData, ProductLinkBlockInput, {
    name: "ProductLink",
    blockMeta: new Meta(ProductLinkBlockData),
});

export { ProductLinkBlock, ProductLinkBlockData };
